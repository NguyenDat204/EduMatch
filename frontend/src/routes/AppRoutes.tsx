import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

// ─── Public Pages ─────────────────────────────────────────────
const Home          = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const Login         = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const Register      = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));


// ─── Assessment Pages ─────────────────────────────────────────
const Survey          = lazy(() => import('../pages/Survey').then(m => ({ default: m.Survey })));
const Result          = lazy(() => import('../pages/Result').then(m => ({ default: m.Result })));
const AcademicProfile = lazy(() => import('../pages/AcademicProfile').then(m => ({ default: m.AcademicProfile })));
const SkillEvaluation = lazy(() => import('../pages/SkillEvaluation').then(m => ({ default: m.SkillEvaluation })));

// ─── Dashboard Pages ──────────────────────────────────────────
const Dashboard        = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Profile          = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const Explore          = lazy(() => import('../pages/Explore').then(m => ({ default: m.Explore })));
const Chat             = lazy(() => import('../pages/Chat').then(m => ({ default: m.Chat })));
const Upgrade          = lazy(() => import('../pages/Upgrade').then(m => ({ default: m.Upgrade })));
const CareerDetails    = lazy(() => import('../pages/CareerDetails').then(m => ({ default: m.CareerDetails })));
const UniversityDetails = lazy(() => import('../pages/UniversityDetails').then(m => ({ default: m.UniversityDetails })));
const CompareCareer    = lazy(() => import('../pages/CompareCareer').then(m => ({ default: m.CompareCareer })));
const FavoriteCareer   = lazy(() => import('../pages/FavoriteCareer').then(m => ({ default: m.FavoriteCareer })));
const CareerPath       = lazy(() => import('../pages/CareerPath').then(m => ({ default: m.CareerPath })));
const Articles         = lazy(() => import('../pages/Articles').then(m => ({ default: m.Articles })));

// ─── Admin Pages ──────────────────────────────────────────────
const AdminLayout = lazy(() => import('../layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminUsers = lazy(() => import('../pages/admin/Users').then(m => ({ default: m.Users })));
const AdminCareers = lazy(() => import('../pages/admin/Careers').then(m => ({ default: m.Careers })));
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics').then(m => ({ default: m.Analytics })));
const AdminFeedback = lazy(() => import('../pages/admin/Feedback').then(m => ({ default: m.Feedback })));

// ─── Loading Fallback ─────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 premium-gradient rounded-2xl animate-pulse" />
  </div>
);

export const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ── Public Pages (with shared Navbar + Footer) ── */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
      <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
      <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />

      {/* ── Assessment (self-managing layout) ── */}
      <Route path="/survey" element={<Survey />} />
      <Route path="/result" element={<Result />} />
      <Route path="/academic-profile" element={<AcademicProfile />} />
      <Route path="/skill-evaluation" element={<SkillEvaluation />} />

      {/* ── Dashboard ── */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/explore/:id" element={<CareerDetails />} />
      <Route path="/universities" element={<Explore />} />
      <Route path="/universities/:id" element={<UniversityDetails />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/upgrade" element={<Upgrade />} />
      
      {/* ── New Exploration Pages ── */}
      <Route path="/compare" element={<CompareCareer />} />
      <Route path="/favorites" element={<FavoriteCareer />} />
      <Route path="/career-path/:id" element={<CareerPath />} />
      <Route path="/articles" element={<Articles />} />

      {/* ── Admin Pages (with AdminLayout) ── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="users" element={<AdminUsers />} />
        <Route path="careers" element={<AdminCareers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="feedback" element={<AdminFeedback />} />
      </Route>
    </Routes>
  </Suspense>
);
