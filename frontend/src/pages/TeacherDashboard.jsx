import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Lấy stats và courses cùng lúc
      const [statsRes, coursesRes] = await Promise.all([
        axios.get('/api/teachers/me/stats'),
        axios.get('/api/teachers/me/courses/with-stats')
      ])
      
      setStats(statsRes.data)
      setCourses(coursesRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Fallback: lấy courses như cũ
      try {
        const response = await axios.get('/api/courses')
        const myCourses = response.data.filter(course => course.teacher_id === user?.id)
        setCourses(myCourses)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
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
          <i className="bi bi-person-badge"></i> Dashboard - Giáo viên
        </h1>
        <Link to="/courses" className="btn btn-primary-custom">
          <i className="bi bi-plus-circle"></i> Tạo khóa học mới
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card-soft text-center">
            <h3 className="text-brand-sky">{stats.totalCourses}</h3>
            <p className="text-muted mb-0">Khóa học của tôi</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-soft text-center">
            <h3 className="text-brand-green">{stats.totalStudents}</h3>
            <p className="text-muted mb-0">Học viên</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-soft text-center">
            <h3 className="text-warning">{stats.pendingSubmissions}</h3>
            <p className="text-muted mb-0">Bài tập cần chấm</p>
          </div>
        </div>
      </div>

      <div className="card-soft">
        <h5 className="mb-4">
          <i className="bi bi-book text-brand-sky me-2"></i>Khóa học của tôi
        </h5>
        {courses.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-book text-muted" style={{ fontSize: '4rem' }}></i>
            <p className="text-muted mt-3">Bạn chưa có khóa học nào.</p>
            <Link to="/courses" className="btn btn-primary-custom mt-2">
              <i className="bi bi-plus-circle"></i> Tạo khóa học mới
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Tên khóa học</th>
                  <th>Cấp độ</th>
                  <th>Hình thức</th>
                  <th>Học viên</th>
                  <th>Giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td><strong>{course.tieu_de}</strong></td>
                    <td>
                      <span className="badge-custom badge-info">{course.cap_do || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="badge-custom badge-success">{course.hinh_thuc || 'online'}</span>
                    </td>
                    <td>
                      <span className="badge-custom badge-info">
                        <i className="bi bi-people"></i> {course.student_count || 0}
                      </span>
                    </td>
                    <td>{new Intl.NumberFormat('vi-VN').format(course.gia)} VNĐ</td>
                    <td>
                      <Link
                        to={`/learn/${course.id}`}
                        className="btn btn-sm btn-primary-custom me-2"
                      >
                        <i className="bi bi-eye"></i> Xem
                      </Link>
                      <Link
                        to={`/assignments/${course.id}`}
                        className="btn btn-sm btn-outline-custom"
                      >
                        <i className="bi bi-file-earmark-check"></i> Bài tập
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}



