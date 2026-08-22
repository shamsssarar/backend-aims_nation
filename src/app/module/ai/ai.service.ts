import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../lib/prisma.js';
import AppError from '../../errorHelpers/AppError.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const chatModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

export const askTutorService = async (
  userMessage: string,
  history: any[] = [],
  courseId: string | null = null,
  authUser?: any
) => {
  // 0. Basic checks
  if (!authUser || !authUser.id) {
    throw new AppError(401, 'Authentication required for AI assistant');
  }

  // Determine role and allowed courseIds
  const role = (authUser as any).role?.toUpperCase?.() || 'STUDENT';
  let allowedCourseIds: string[] = [];

  if (role === 'STUDENT') {
    // Map auth user -> student profile
    const studentProfile = await prisma.student.findUnique({ where: { userId: authUser.id } });
    if (!studentProfile) throw new AppError(403, 'Student profile not found.');

    if (courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: studentProfile.id, courseId } },
      });
      if (!enrollment || enrollment.status !== 'ACTIVE') {
        throw new AppError(403, 'You are not enrolled in the requested course.');
      }
      allowedCourseIds = [courseId];
    } else {
      const enrolls = await prisma.enrollment.findMany({
        where: { studentId: studentProfile.id, status: 'ACTIVE' },
        select: { courseId: true },
      });
      allowedCourseIds = enrolls.map((e) => e.courseId);
      if (allowedCourseIds.length === 0) {
        throw new AppError(403, 'You are not enrolled in any courses.');
      }
    }
  } else if (role === 'TEACHER') {
    const teacherProfile = await prisma.teacher.findUnique({ where: { userId: authUser.id } });
    if (!teacherProfile) throw new AppError(403, 'Teacher profile not found.');

    if (courseId) {
      const course = await prisma.course.findFirst({ where: { id: courseId, teacherId: teacherProfile.id }, select: { id: true } });
      if (!course) {
        throw new AppError(403, 'You do not have permission to access this course.');
      }
      allowedCourseIds = [courseId];
    } else {
      const courses = await prisma.course.findMany({ where: { teacherId: teacherProfile.id }, select: { id: true } });
      allowedCourseIds = courses.map((c) => c.id);
      if (allowedCourseIds.length === 0) throw new AppError(403, 'No assigned courses found for this teacher.');
    }
  } else if (role === 'ADMIN') {
    if (courseId) {
      allowedCourseIds = [courseId];
    } else {
      // For least privilege we require admins to provide a courseId. Adjust if policy allows global admin search.
      throw new AppError(400, 'Admin must provide courseId for AI queries.');
    }
  } else {
    throw new AppError(403, 'Unknown role');
  }

  if (!allowedCourseIds || allowedCourseIds.length === 0) {
    throw new AppError(403, 'No authorized course context available for AI retrieval.');
  }

  // 1. Turn the user's question into an embedding
  const embedResult = await embedModel.embedContent(userMessage);
  const queryVector = embedResult.embedding.values;
  const vectorString = `[${queryVector.join(',')}]`;

  // 2. Build a safe IN list (escape single quotes as a pragmatic measure)
  const sanitizedIds = allowedCourseIds.map((id) => id.replace(/'/g, "''")).map((id) => `'${id}'`).join(',');

  // 3. Scoped retrieval by allowed courseIds
  const relevantChunks = await prisma.$queryRawUnsafe(
    `SELECT content, metadata, sourceId, (embedding <=> ${vectorString}::vector) as distance
     FROM "document_embeddings"
     WHERE "sourceType" = 'COURSE'
       AND "isDeleted" = false
       AND "sourceId" IN (${sanitizedIds})
     ORDER BY distance ASC
     LIMIT 5;`
  );

  // 4. Assemble the verified data
  const contextString = relevantChunks.map((chunk: any) => chunk.content).join('\n\n');

  // 5. Compose prompt (keep existing system prompt)
  const augmentedPrompt = `
    You are the official AiMS Nation AI Assistant, a friendly, knowledgeable, and persuasive educational guide.

    CORE GUIDELINES:
    1. Tone & Greeting: Be warm, welcoming, and helpful for general small talk and greetings.
    2. Factual Accuracy: For questions about course details, prices, or capacity, you must strictly use ONLY the VERIFIED DATABASE CONTEXT below. Do not invent prices or schedules.
    3. Boundaries: If the user asks about unrelated topics, politely explain that your expertise is strictly limited to AiMS Nation courses and educational offerings.
    4. Formatting: Always format prices using the Bangladeshi Taka symbol (৳).

    VERIFIED DATABASE CONTEXT:
    ${contextString || 'No specific course data found for this query.'}

    ---
    USER QUESTION:
    ${userMessage}
  `;

  const safeHistory = (history || []).filter((msg: any) => {
    return msg?.parts?.[0]?.text && msg.parts[0].text.trim() !== '';
  });

  // 6. Generate and return using chat model
  const chat = chatModel.startChat({ history: safeHistory });
  const result = await chat.sendMessage(augmentedPrompt);

  // 7. Audit log
  console.info('AI retrieval', { userId: authUser.id, role, allowedCourseIds, returnedSources: relevantChunks.map((r: any) => r.sourceId) });

  return result.response.text();
};

export const askTutorPublicService = async (userMessage: string, courseId: string) => {
  // 1. Fetch only public course metadata
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      courseFee: true,
      schedule: true,
      maxCapacity: true,
      teacher: { select: { user: { select: { name: true } } } },
      updatedAt: true,
    },
  });

  if (!course) {
    throw new AppError(404, 'Course not found');
  }

  // 2. Build a tightly-scoped system prompt that MUST only use this metadata
  const metaParts = [
    `Title: ${course.title}`,
    `ShortDescription: ${course.description ?? 'N/A'}`,
    `Fee: ${course.courseFee}`,
    `Schedule: ${course.schedule ?? 'N/A'}`,
    `Capacity: ${course.maxCapacity}`,
    `Teacher: ${course.teacher?.user?.name ?? 'N/A'}`,
  ];

  const systemPrompt = `You are the AiMS Nation public assistant. Use ONLY the following VERIFIED PUBLIC COURSE METADATA to answer in at most 3 short sentences. Do NOT invent or hallucinate internal course content, materials, or protected information. If the user asks for internal content, reply with a short CTA: 'Please login or enroll to access course materials.'\n\n${metaParts.join('\n')}`;

  const userPrompt = `User question: ${userMessage}`;

  // 3. Call chatModel WITHOUT any document embeddings or vector store
  const chat = chatModel.startChat({ history: [{ author: 'system', content: [{ type: 'text', text: systemPrompt }] }] });
  const result = await chat.sendMessage(userPrompt);

  // 4. Return text response
  return result.response.text();
};
