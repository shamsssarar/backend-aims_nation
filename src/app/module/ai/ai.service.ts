import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../lib/prisma.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const chatModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

export const askTutorService = async (userMessage: string, history: any[] = []) => {
  // 1. Turn the user's question into 3072 numbers (Vector)
  const embedResult = await embedModel.embedContent(userMessage);
  const queryVector = embedResult.embedding.values;
  const vectorString = `[${queryVector.join(',')}]`;

  // 2. THE SENIOR RETRIEVAL
  // We use <=> for cosine distance, and we strictly filter by sourceType "COURSE"
  const relevantChunks = await prisma.$queryRaw<any[]>`
    SELECT 
      "content", 
      "metadata",
      (embedding <=> ${vectorString}::vector) as distance
    FROM "document_embeddings"
    WHERE "sourceType" = 'COURSE' 
      AND "isDeleted" = false
    ORDER BY distance ASC
    LIMIT 3;
  `;

  // 3. Assemble the verified data
  const contextString = relevantChunks.map((chunk) => chunk.content).join('\n\n');

  // 4. THE LEASH (System Prompt)
  const augmentedPrompt = `
    You are the official AiMS Nation AI Assistant, a friendly, knowledgeable, and persuasive educational guide.
    
    CORE GUIDELINES:
    1. Tone & Greeting: Be warm, welcoming, and helpful for general small talk and greetings.
    2. Factual Accuracy: For questions about course details, prices, or capacity, you must strictly use ONLY the VERIFIED DATABASE CONTEXT below. Do not invent prices or schedules.
    3. Boundaries: If the user asks about unrelated topics, politely explain that your expertise is strictly limited to AiMS Nation courses and educational offerings.
    4. Formatting: Always format prices using the Bangladeshi Taka symbol (৳).

    SPECIAL SCENARIOS:
    5. Trend Inquiries: If the user asks what is trending or popular, highly recommend Robotics or other tech-based courses found in the context. Pitch them by explaining that the world is moving toward an AI-driven future! Highlight our affordable fees and the exclusive, focused learning environment (based on the student capacity).
    6. Course Advantages: If the user asks about the reliability, features, or benefits of a specific course, enthusiastically summarize the provided course details. Then, logically extrapolate a real-world benefit based on the course title (e.g., career readiness, skill development) to motivate the student.
    7. Content & Newsletter Suggestions: Whenever a user shows strong interest in a specific subject (like Robotics, Art, or English), proactively recommend they check out related free content. 
       - For Tech/Robotics: Suggest subscribing to the "AiMS Future Tech Newsletter" or reading the blog "Why Kids Need Coding."
       - For English/Communication: Suggest the "AiMS Daily Vocabulary" email list.
       - For Art/Cooking: Suggest the "Creative Hands Weekly" blog.
       (Frame these as free, valuable resources available on the AiMS Nation website to keep them engaged).

    VERIFIED DATABASE CONTEXT:
    ${contextString || 'No specific course data found for this query.'}
    
    ---
    USER QUESTION:
    ${userMessage}
  `;

  const safeHistory = (history || []).filter((msg: any) => {
    return msg?.parts?.[0]?.text && msg.parts[0].text.trim() !== '';
  });

  // 5. Generate and return
  // We pass the conversation history so the AI remembers previous messages
  const chat = chatModel.startChat({ history: safeHistory });
  const result = await chat.sendMessage(augmentedPrompt);

  // Extract JUST the text string to prevent crashing the Express controller
  return result.response.text();
};
