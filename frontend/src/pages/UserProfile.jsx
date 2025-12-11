import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function UserProfile() {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState(null)
  const [formData, setFormData] = useState({
    ho_ten: user?.ho_ten || '',
    email: user?.email || '',
    so_dien_thoai: user?.so_dien_thoai || ''
  })
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/users/me/history')
      setHistory(response.data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    }
  }

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const response = await axios.put('/api/users/me', formData)
      setUser(response.data)
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Cập nhật thất bại' })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp' })
      return
    }
    
    if (passwordForm.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự' })
      return
    }
    
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      await axios.post('/api/users/me/change-password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Đổi mật khẩu thất bại' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="title-gradient">
          <i className="bi bi-person-circle"></i> Tài khoản cá nhân
        </h1>
        <Link to="/dashboard" className="btn btn-outline-custom">
          <i className="bi bi-arrow-left"></i> Quay lại
        </Link>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <i className="bi bi-person"></i> Thông tin cá nhân
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="bi bi-clock-history"></i> Lịch sử học tập
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <i className="bi bi-key"></i> Đổi mật khẩu
          </button>
        </li>
      </ul>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="card-soft">
          <h5 className="mb-4">Thông tin cá nhân</h5>
          <form onSubmit={handleUpdateInfo}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.ho_ten}
                  onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.so_dien_thoai}
                  onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Vai trò</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
                  disabled
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary-custom" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card-soft">
          <h5 className="mb-4">Lịch sử học tập</h5>
          {history ? (
            <>
              <div className="mb-3">
                <p className="text-muted">Tổng số khóa học đã đăng ký: <strong>{history.total_courses}</strong></p>
              </div>
              {history.courses.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-book text-muted" style={{ fontSize: '4rem' }}></i>
                  <p className="text-muted mt-3">Bạn chưa đăng ký khóa học nào</p>
                  <Link to="/courses" className="btn btn-primary-custom mt-2">
                    <i className="bi bi-search"></i> Tìm khóa học
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Khóa học</th>
                        <th>Ngày đăng ký</th>
                        <th>Tiến độ</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.courses.map((course) => (
                        <tr key={course.course_id}>
                          <td><strong>{course.course_title}</strong></td>
                          <td>
                            {course.enrollment_date
                              ? new Date(course.enrollment_date).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '20px' }}>
                                <div
                                  className="progress-bar bg-success"
                                  style={{ width: `${course.progress_percentage}%` }}
                                >
                                  {course.progress_percentage}%
                                </div>
                              </div>
                              <small className="text-muted">
                                {course.completed_lessons}/{course.total_lessons}
                              </small>
                            </div>
                          </td>
                          <td>
                            <Link
                              to={`/learn/${course.course_id}`}
                              className="btn btn-sm btn-primary-custom"
                            >
                              <i className="bi bi-play-circle"></i> Tiếp tục học
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card-soft">
          <h5 className="mb-4">Đổi mật khẩu</h5>
          <form onSubmit={handleChangePassword}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Mật khẩu cũ</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary-custom" disabled={loading}>
              {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

