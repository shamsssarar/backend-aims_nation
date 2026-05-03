import { prisma } from '../../lib/prisma.js';

export const getSimilarCourses = async (targetCourseId: string) => {
  // 1. Fetch the exact vector of the course the user is currently viewing
  const targetEmbedding = await prisma.$queryRaw<any[]>`
    SELECT embedding::text 
    FROM "document_embeddings" 
    WHERE "sourceId" = ${targetCourseId} 
      AND "sourceType" = 'COURSE'
    LIMIT 1;
  `;

  if (!targetEmbedding || targetEmbedding.length === 0) {
    return []; // Course hasn't been vectorized yet
  }

  const vectorString = targetEmbedding[0].embedding;

  // 2. Perform a nearest-neighbor search (Cosine Similarity)
  // We exclude the target course itself so it doesn't recommend itself!
  const recommendations = await prisma.$queryRaw<any[]>`
    SELECT 
      "sourceId" as "courseId",
      "metadata",
      (embedding <=> ${vectorString}::vector) as distance
    FROM "document_embeddings"
    WHERE "sourceType" = 'COURSE' 
      AND "sourceId" != ${targetCourseId}
      AND "isDeleted" = false
    ORDER BY distance ASC
    LIMIT 3;
  `;

  // 3. (Optional) You can fetch the full Course details here if needed,
  // or just return the metadata JSON if you stored the title/image inside it!
  return recommendations;
};
