import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import Loader from '../components/common/Loader';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage'));
const QuizSetupPage = lazy(() => import('../pages/QuizSetupPage'));
const QuizPage = lazy(() => import('../pages/QuizPage'));
const ResultPage = lazy(() => import('../pages/ResultPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage'));
const AnalyticsDashboard = lazy(() => import('../pages/AnalyticsDashboard'));
const PerformancePage = lazy(() => import('../pages/PerformancePage'));
const TopicAnalysisPage = lazy(() => import('../pages/TopicAnalysisPage'));
const RecommendationsPage = lazy(() => import('../pages/RecommendationsPage'));
const AchievementsPage = lazy(() => import('../pages/AchievementsPage'));
const ChallengesPage = lazy(() => import('../pages/ChallengesPage'));
const GamificationDashboard = lazy(() => import('../pages/GamificationDashboard'));
const SocialSharePage = lazy(() => import('../pages/SocialSharePage'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const QuestionManagement = lazy(() => import('../pages/admin/QuestionManagement'));
const CategoryManagement = lazy(() => import('../pages/admin/CategoryManagement'));
const ChallengeManagement = lazy(() => import('../pages/admin/ChallengeManagement'));
const AchievementManagement = lazy(() => import('../pages/admin/AchievementManagement'));
const AIMonitoringDashboard = lazy(() => import('../pages/admin/AIMonitoringDashboard'));

function ProtectedElement({ children, roles }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

function LoadingFallback() {
  return <div className="grid min-h-[40vh] place-items-center"><Loader text="Loading module..." /></div>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<ProtectedElement><DashboardPage /></ProtectedElement>} />
          <Route path="/categories" element={<ProtectedElement><CategoriesPage /></ProtectedElement>} />
          <Route path="/quiz/setup" element={<ProtectedElement><QuizSetupPage /></ProtectedElement>} />
          <Route path="/quiz/play" element={<ProtectedElement><QuizPage /></ProtectedElement>} />
          <Route path="/quiz/result" element={<ProtectedElement><ResultPage /></ProtectedElement>} />
          <Route path="/quiz/history" element={<ProtectedElement><HistoryPage /></ProtectedElement>} />
          <Route path="/leaderboard" element={<ProtectedElement><LeaderboardPage /></ProtectedElement>} />
          <Route path="/analytics/dashboard" element={<ProtectedElement><AnalyticsDashboard /></ProtectedElement>} />
          <Route path="/analytics/performance" element={<ProtectedElement><PerformancePage /></ProtectedElement>} />
          <Route path="/analytics/topics" element={<ProtectedElement><TopicAnalysisPage /></ProtectedElement>} />
          <Route path="/recommendations" element={<ProtectedElement><RecommendationsPage /></ProtectedElement>} />
          <Route path="/achievements" element={<ProtectedElement><AchievementsPage /></ProtectedElement>} />
          <Route path="/challenges" element={<ProtectedElement><ChallengesPage /></ProtectedElement>} />
          <Route path="/gamification" element={<ProtectedElement><GamificationDashboard /></ProtectedElement>} />
          <Route path="/share" element={<ProtectedElement><SocialSharePage /></ProtectedElement>} />

          <Route path="/admin" element={<ProtectedElement roles={['admin']}><AdminLayout /></ProtectedElement>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="questions" element={<QuestionManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="challenges" element={<ChallengeManagement />} />
            <Route path="achievements" element={<AchievementManagement />} />
            <Route path="ai-monitoring" element={<AIMonitoringDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
