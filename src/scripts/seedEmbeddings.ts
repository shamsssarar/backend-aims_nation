import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure you load your .env variables if this runs outside your main app
// import dotenv from 'dotenv';
// dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

async function main() {
  console.log('🌱 Starting AI Vector Seeding for AiMS Nation...');

  await prisma.$executeRawUnsafe(
    'ALTER TABLE "document_embeddings" ALTER COLUMN "embedding" TYPE vector(3072);'
  );
  await prisma.documentEmbedding.deleteMany({});
  console.log('🧹 Cleared old vector data...');
  // 1. Fetch all existing courses from your main table
  const courses = await prisma.course.findMany();
  console.log(`Found ${courses.length} courses to vectorize.`);

  for (const course of courses) {
    // 2. Prevent duplicates (Don't charge your API twice for the same course)
    const chunkKey = `course_summary_${course.id}`;
    const existing = await prisma.documentEmbedding.findUnique({
      where: { chunkKey: chunkKey },
    });

    if (existing) {
      console.log(`⏭️ Skipping "${course.title}" - Already vectorized.`);
      continue;
    }

    // 3. Create the text "chunk" that the AI will read
    const chunkText = `Course: ${course.title}. Description: ${course.description || 'No description provided.'} Fee: ৳${course.courseFee}. Capacity: ${course.maxCapacity || 'Unlimited'}.`;

    try {
      // 4. Send the text to Gemini to get the 768 numbers
      const embedResult = await embedModel.embedContent(chunkText);
      const vectorString = `[${embedResult.embedding.values.join(',')}]`;

      // 5. Senior Trick: Create the base record safely using Prisma
      const newDoc = await prisma.documentEmbedding.create({
        data: {
          chunkKey: chunkKey,
          sourceType: 'COURSE',
          sourceId: course.id,
          sourceLabel: course.title,
          content: chunkText,
          // Storing metadata here makes your frontend rendering much faster later
          metadata: {
            title: course.title,
            courseFee: course.courseFee,
          },
        },
      });

      // 6. Update the record with the raw vector math
      await prisma.$executeRaw`
        UPDATE "document_embeddings" 
        SET embedding = ${vectorString}::vector 
        WHERE id = ${newDoc.id}
      `;

      console.log(`✅ Successfully vectorized: ${course.title}`);
    } catch (error) {
      console.error(`❌ Failed to vectorize ${course.title}:`, error);
    }
  }

  console.log('🎉 Seeding complete! The AiMS Nation AI brain is now active.');
}

// Execute the script
main()
  .catch((e) => {
    console.error('Fatal Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
