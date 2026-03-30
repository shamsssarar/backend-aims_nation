import { Router } from 'express';
import { CourseRoutes } from '../module/course/course.route';
import { UserRoutes } from '../module/user/user.route';
import { EnrollmentRoutes } from '../module/enrollment/enrollment.route';
import { PaymentRoutes } from '../module/payment/payment.route';
import { ProfileRoutes } from '../module/profile/profile.route';
import { TeacherApplicationRoutes } from '../module/teacherApplication/teacherApplication.route';
import { StudyMaterialRoutes } from '../module/studyMaterial/studyMaterial.route';
import { WeeklyReportRoutes } from '../module/weeklyReport/weeklyReport.route';
import { TeacherRoutes } from '../module/teacher/teacher.route';
import { AdminRoutes } from '../module/admin/admin.route';
import { StudentRoutes } from '../module/student/student.route';

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
