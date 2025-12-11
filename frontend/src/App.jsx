import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import LearnPage from './pages/LearnPage'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import TeacherGrading from './pages/TeacherGrading'
import Certificate from './pages/Certificate'
import Layout from './components/Layout'
import { AuthProvider } from './context/AuthContext'

// Router component để chọn dashboard dựa trên role
function DashboardRouter() {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (user.vai_tro === 'admin') {
    return <AdminDashboard />
  } else if (user.vai_tro === 'teacher') {
    return <TeacherDashboard />
  } else {
    return <StudentDashboard />
  }
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/courses" replace />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="learn/:id" element={<LearnPage />} />
            <Route path="grade/:courseId/:assignmentId" element={<TeacherGrading />} />
            <Route path="certificate/:id" element={<Certificate />} />
            <Route path="dashboard" element={<DashboardRouter />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

