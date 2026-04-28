// src/module/ai/ai.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../lib/prisma'; // Adjust path if needed

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: `You are the official AI Assistant and Tutor for AiMS Nation. 
  You are polite, professional, and helpful. 
  When answering questions about available courses, ALWAYS use the "LIVE DATABASE CONTEXT" provided in the prompt. Do not make up courses or prices.
  If a student asks a coding or academic question, guide them using Socratic questioning.`,
});

export const askTutorService = async (message: string, history: any[]) => {
  // 1. RETRIEVAL: Fetch live courses from Prisma
  const activeCourses = await prisma.course.findMany({
    select: {
      title: true,
      courseFee: true,
      description: true,
      maxCapacity: true,
    },
  });

  const courseDataString = activeCourses
    .map(
      (course) =>
        `- ${course.title}: Costs $${course.courseFee}. Details: ${course.description}. Capacity: ${course.maxCapacity}`
    )
    .join('\n');

  // 2. AUGMENTATION: Combine database facts with user message
  const augmentedMessage = `
    LIVE DATABASE CONTEXT (Use this to answer the user's question accurately):
    ${courseDataString || 'No courses available at the moment.'}

    ---
    USER MESSAGE:
    ${message}
  `;

  // 3. GENERATION: Send to Gemini
  const chat = model.startChat({
    history: history || [],
  });

  const result = await chat.sendMessage(augmentedMessage);
  return result.response.text();
};
