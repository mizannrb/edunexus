import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { PrivateRoute, AdminRoute } from './components/auth/ProtectedRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import CourseFormPage from './pages/CourseFormPage'
import AboutPage from './pages/AboutPage'

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/courses" element={<Layout><CoursesPage /></Layout>} />
        <Route path="/courses/:slug" element={<Layout><CourseDetailPage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />

        <Route path="/login" element={<><Navbar /><LoginPage /></>} />
        <Route path="/register" element={<><Navbar /><RegisterPage /></>} />

        <Route path="/dashboard" element={
          <PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute><Layout><AdminPage /></Layout></AdminRoute>
        } />
        <Route path="/admin/courses/new" element={
          <AdminRoute><CourseFormPage /></AdminRoute>
        } />
        <Route path="/admin/courses/:id/edit" element={
          <AdminRoute><CourseFormPage /></AdminRoute>
        } />

        <Route path="*" element={
          <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="text-8xl font-bold text-gray-200">404</div>
              <h2 className="font-heading font-bold text-2xl text-gray-700 mt-4">Page Not Found</h2>
              <p className="text-gray-500 mt-2 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}