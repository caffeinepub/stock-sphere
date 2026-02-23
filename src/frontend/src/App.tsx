import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import FeedPage from './pages/FeedPage';
import UserProfilePage from './pages/UserProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import MarketplacePage from './pages/MarketplacePage';
import CreateCoursePage from './pages/CreateCoursePage';
import CourseDetailPage from './pages/CourseDetailPage';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function AppContent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWrapper,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: FeedPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principalId',
  component: UserProfilePage,
});

const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/edit',
  component: EditProfilePage,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: MarketplacePage,
});

const createCourseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-course',
  component: CreateCoursePage,
});

const courseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/course/$id',
  component: CourseDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  editProfileRoute,
  marketplaceRoute,
  createCourseRoute,
  courseDetailRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}
