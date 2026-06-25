import { Student } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { QueryBuilder } from '../../utils/queryBuilder.js';
import { IQueryParams } from '../../interfaces/query.interface.js';

const getAllStudents = async (query: IQueryParams) => {
  // 1. Initialize Builder
  const studentQuery = new QueryBuilder<Student>(prisma.student, query, {
    searchableFields: ['user.name', 'user.email', 'contactNo', 'address'],
    filterableFields: ['gender', 'bloodGroup', 'isDeleted'],
  });

  // 2. Chain and Execute the query
  const result = await studentQuery
    .search()
    .filter()
    .sort()
    .paginate()
    .include({
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    })
    .execute();

  // 👉 3. Flatten the result.data exactly as you requested!
  const flattenedData = result.data.map((student: any) => ({
    id: student.id,
    userId: student.userId,
    name: student.user?.name || 'Unknown',
    email: student.user?.email || 'Unknown',
    contactNo: student.contactNo || 'N/A',
    bloodGroup: student.bloodGroup || 'N/A',
    // You can spread the rest of the student properties if you want them all:
    // ...student
  }));

  // 👉 4. Return the new flattened data while safely keeping the pagination meta
  return {
    meta: result.meta,
    data: flattenedData,
  };
};

const updateStudent = async (
  id: string,
  payload: Partial<{
    contactNo?: string;
    bloodGroup?: string;
    schoolGrade?: string;
    dateOfBirth?: string;
  }>
): Promise<any> => {
  // 1. Smart Lookup: Check if 'id' matches the Student PK *OR* the User FK
  const student = await prisma.student.findFirst({
    where: {
      OR: [{ id: id }, { userId: id }],
    },
  });

  // 2. Safety Check
  if (!student) {
    throw new Error('Record to update not found. No student matches this ID.');
  }

  // 3. Now perform the update using the true Student Primary Key
  const result = await prisma.student.update({
    where: {
      id: student.id,
    },
    data: payload,
  });

  return result;
};

export const StudentServices = { getAllStudents, updateStudent };
