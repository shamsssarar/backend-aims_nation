import { Router } from 'express';
import { CourseRoutes } from '../module/course/course.route.js';
import { UserRoutes } from '../module/user/user.route.js';
import { EnrollmentRoutes } from '../module/enrollment/enrollment.route.js';
import { PaymentRoutes } from '../module/payment/payment.route.js';
import { ProfileRoutes } from '../module/profile/profile.route.js';
import { TeacherApplicationRoutes } from '../module/teacherApplication/teacherApplication.route.js';
import { StudyMaterialRoutes } from '../module/studyMaterial/studyMaterial.route.js';
import { WeeklyReportRoutes } from '../module/weeklyReport/weeklyReport.route.js';
import { TeacherRoutes } from '../module/teacher/teacher.route.js';
import { AdminRoutes } from '../module/admin/admin.route.js';
import { StudentRoutes } from '../module/student/student.route.js';

const router = Router();

router.use('/courses', CourseRoutes);

router.use('/user', UserRoutes);

router.use('/enrollments', EnrollmentRoutes);

router.use('/payments', PaymentRoutes);

router.use('/profiles', ProfileRoutes);

router.use('/careers', TeacherApplicationRoutes);

router.use('/weeklyReports', WeeklyReportRoutes);

router.use('/materials', StudyMaterialRoutes);

router.use('/teachers', TeacherRoutes);

router.use('/admin', AdminRoutes);

router.use('/students', StudentRoutes);

export const IndexRoutes = router;
