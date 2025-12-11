import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0
  })
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, coursesRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/courses'),
        axios.get('/api/users')
      ])
      
      setStats(statsRes.data)
      setCourses(coursesRes.data)
      setUsers(usersRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Fallback: tính toán từ courses và users
      try {
        const [coursesRes, usersRes] = await Promise.all([
          axios.get('/api/courses'),
          axios.get('/api/users')
        ])
        
        const teachers = usersRes.data?.filter(u => u.role === 'teacher' || u.vai_tro === 'teacher') || []
        const students = usersRes.data?.filter(u => u.role === 'student' || u.vai_tro === 'student') || []
        
        setStats({
          totalCourses: coursesRes.data.length,
          totalUsers: usersRes.data?.length || 0,
          totalTeachers: teachers.length,
          totalStudents: students.length
        })
        
        setCourses(coursesRes.data)
        setUsers(usersRes.data || [])
      } catch (err) {
        console.error('Failed to fetch fallback data:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="title-gradient">
          <i className="bi bi-shield-check"></i> Dashboard - Quản trị viên
        </h1>
        <Link to="/courses" className="btn btn-primary-custom">
          <i className="bi bi-plus-circle"></i> Tạo khóa học
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card-soft text-center">
            <h3 className="text-primary">{stats.totalCourses}</h3>
            <p className="text-muted mb-0">Tổng khóa học</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-soft text-center">
            <h3 className="text-success">{stats.totalUsers}</h3>
            <p className="text-muted mb-0">Tổng người dùng</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-soft text-center">
            <h3 className="text-info">{stats.totalTeachers}</h3>
            <p className="text-muted mb-0">Giáo viên</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-soft text-center">
            <h3 className="text-warning">{stats.totalStudents}</h3>
            <p className="text-muted mb-0">Học viên</p>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Courses Table */}
        <div className="col-md-8 mb-4">
          <div className="card-soft">
            <h5 className="mb-4">
              <i className="bi bi-book text-brand-sky me-2"></i>Quản lý khóa học
            </h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Tên khóa học</th>
                    <th>Cấp độ</th>
                    <th>Giá</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.slice(0, 5).map((course) => (
                    <tr key={course.id}>
                      <td><strong>{course.tieu_de}</strong></td>
                      <td>
                        <span className="badge-custom badge-info">{course.cap_do || 'N/A'}</span>
                      </td>
                      <td>{new Intl.NumberFormat('vi-VN').format(course.gia)} VNĐ</td>
                      <td>
                        <Link
                          to={`/courses/${course.id}`}
                          className="btn btn-sm btn-outline-custom"
                        >
                          <i className="bi bi-eye"></i> Xem
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-3">
              <Link to="/courses" className="btn btn-outline-custom">
                Xem tất cả khóa học
              </Link>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="col-md-4 mb-4">
          <div className="card-soft">
            <h5 className="mb-4">
              <i className="bi bi-people text-brand-sky me-2"></i>Người dùng
            </h5>
            <div className="list-group">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{u.ho_ten}</strong>
                      <br />
                      <small className="text-muted">{u.email}</small>
                    </div>
                    <span className={`badge bg-${u.vai_tro === 'teacher' ? 'info' : u.vai_tro === 'admin' ? 'danger' : 'secondary'}`}>
                      {u.vai_tro}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



