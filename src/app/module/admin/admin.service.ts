// backend/src/app/module/admin/admin.service.ts
import { prisma } from '../../lib/prisma.js'; // Adjust path to your prisma client

const getDashboardAnalytics = async () => {
  // 1. Total Active Students (Counting unique students who have active enrollments)

  const activeEnrollments = await prisma.enrollment.groupBy({
    by: ['studentId'],
    where: { status: 'ACTIVE' },
  });
  const totalStudents = activeEnrollments.length; // Each unique studentId represents one active student

  // 2. Total Active Courses
  const totalCourses = await prisma.course.count({
    where: { deletedAt: null }, // Assuming you use soft deletes
  });

  // 3. Total Revenue (Summing up all PAID payments)
  // NOTE: Adjust 'amount' and 'PAID' to match your actual Payment model fields!
  const revenueData = await prisma.invoice.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: 'PAID',
    },
  });

  // 4. Pending Payments (Count of people who haven't paid)
  const pendingPayments = await prisma.invoice.count({
    where: {
      status: 'PENDING',
    },
  });

  // 5. Return a clean, single object
  return {
    totalStudents: totalStudents,
    totalCourses,
    totalRevenue: revenueData._sum.amount || 0,
    pendingPaymentsCount: pendingPayments,
  };
};

export const AdminServices = { getDashboardAnalytics };
