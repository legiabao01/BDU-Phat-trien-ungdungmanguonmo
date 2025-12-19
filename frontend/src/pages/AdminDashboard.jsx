import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0
  })
  const [courses, setCourses] = useState([])
  const [pendingCourses, setPendingCourses] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  
  // Quản lý tiền
  const [pendingDeposits, setPendingDeposits] = useState([])
  const [revenueByCourse, setRevenueByCourse] = useState([])
  const [totalRevenue, setTotalRevenue] = useState({ tong_doanh_thu: 0, tong_so_giao_dich: 0 })

  // Tạo/chỉnh sửa khóa học
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [newCourse, setNewCourse] = useState({
    tieu_de: '',
    mo_ta: '',
    cap_do: 'Beginner',
    hinh_anh: '',
    gia: 0,
    gia_goc: null,
    so_buoi: 0,
    thoi_luong: '',
    hinh_thuc: 'online',
    teacher_id: null
  })

  useEffect(() => {
    fetchData()
    if (activeTab === 'courses') {
      fetchTeachers()
    }
  }, [activeTab])

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/users')
      const teachersList = res.data.filter(u => u.role === 'teacher')
      setTeachers(teachersList)
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    }
  }

  const fetchData = async () => {
    try {
      const [statsRes, coursesRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/courses?status=active'),
        axios.get('/api/users')
      ])
      
      setStats(statsRes.data)
      setCourses(coursesRes.data)
      setUsers(usersRes.data || [])

      if (activeTab === 'courses') {
        const pendingRes = await axios.get('/api/admin/courses/pending')
        setPendingCourses(pendingRes.data)
      }
      
      if (activeTab === 'wallet') {
        await fetchWalletData()
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletData = async () => {
    try {
      const [depositsRes, revenueRes, totalRes] = await Promise.all([
        axios.get('/api/admin/deposits/pending'),
        axios.get('/api/admin/revenue/by-course'),
        axios.get('/api/admin/revenue/total')
      ])
      setPendingDeposits(depositsRes.data)
      setRevenueByCourse(revenueRes.data)
      setTotalRevenue(totalRes.data)
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    }
  }

  const handleApproveDeposit = async (transactionId) => {
    setActionLoading({ ...actionLoading, [`approve-${transactionId}`]: true })
    try {
      await axios.post(`/api/admin/deposits/${transactionId}/approve`)
      await fetchWalletData()
      alert('Đã duyệt giao dịch thành công!')
    } catch (error) {
      alert(error.response?.data?.detail || 'Có lỗi xảy ra')
    } finally {
      setActionLoading({ ...actionLoading, [`approve-${transactionId}`]: false })
    }
  }

  const handleRejectDeposit = async (transactionId) => {
    const ghiChu = prompt('Nhập lý do từ chối (tùy chọn):')
    setActionLoading({ ...actionLoading, [`reject-${transactionId}`]: true })
    try {
      await axios.post(`/api/admin/deposits/${transactionId}/reject`, null, {
        params: { ghi_chu: ghiChu || '' }
      })
      await fetchWalletData()
      alert('Đã từ chối giao dịch')
    } catch (error) {
      alert(error.response?.data?.detail || 'Có lỗi xảy ra')
    } finally {
      setActionLoading({ ...actionLoading, [`reject-${transactionId}`]: false })
    }
  }

  const handleApproveCourse = async (courseId) => {
    setActionLoading({ ...actionLoading, [`approve-${courseId}`]: true })
    try {
      await axios.put(`/api/admin/courses/${courseId}/approve`)
      alert('Đã duyệt khóa học thành công!')
      fetchData()
    } catch (error) {
      alert('Duyệt khóa học thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setActionLoading({ ...actionLoading, [`approve-${courseId}`]: false })
    }
  }

  const handleUpdateCourseStatus = async (courseId, status) => {
    setActionLoading({ ...actionLoading, [`status-${courseId}`]: true })
    try {
      await axios.put(`/api/admin/courses/${courseId}/status`, { status })
      alert('Cập nhật trạng thái thành công!')
      fetchData()
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setActionLoading({ ...actionLoading, [`status-${courseId}`]: false })
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setActionLoading({ ...actionLoading, create: true })
    try {
      const payload = {
        ...newCourse,
        gia: Number(newCourse.gia) || 0,
        gia_goc: newCourse.gia_goc ? Number(newCourse.gia_goc) : null,
        so_buoi: Number(newCourse.so_buoi) || 0,
        teacher_id: newCourse.teacher_id || null
      }
      await axios.post('/api/courses', payload)
      alert('Tạo khóa học thành công! Khóa học sẽ ở trạng thái bản nháp.')
      resetCourseForm()
      fetchData()
    } catch (error) {
      alert('Tạo khóa học thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setActionLoading({ ...actionLoading, create: false })
    }
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setNewCourse({
      tieu_de: course.tieu_de || '',
      mo_ta: course.mo_ta || '',
      cap_do: course.cap_do || 'Beginner',
      hinh_anh: course.hinh_anh || '',
      gia: course.gia || 0,
      gia_goc: course.gia_goc || null,
      so_buoi: course.so_buoi || 0,
      thoi_luong: course.thoi_luong || '',
      hinh_thuc: course.hinh_thuc || 'online',
      teacher_id: course.teacher_id || null
    })
    setShowCreateForm(true)
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    if (!editingCourse) return
    
    setActionLoading({ ...actionLoading, update: true })
    try {
      const payload = {
        ...newCourse,
        gia: Number(newCourse.gia) || 0,
        gia_goc: newCourse.gia_goc ? Number(newCourse.gia_goc) : null,
        so_buoi: Number(newCourse.so_buoi) || 0,
        teacher_id: newCourse.teacher_id || null
      }
      await axios.put(`/api/admin/courses/${editingCourse.id}`, payload)
      alert('Cập nhật khóa học thành công!')
      resetCourseForm()
      fetchData()
    } catch (error) {
      alert('Cập nhật khóa học thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setActionLoading({ ...actionLoading, update: false })
    }
  }

  const resetCourseForm = () => {
    setNewCourse({
      tieu_de: '',
      mo_ta: '',
      cap_do: 'Beginner',
      hinh_anh: '',
      gia: 0,
      gia_goc: null,
      so_buoi: 0,
      thoi_luong: '',
      hinh_thuc: 'online',
      teacher_id: null
    })
    setEditingCourse(null)
    setShowCreateForm(false)
  }

  const handleUpdateUserStatus = async (userId, isActive) => {
    setActionLoading({ ...actionLoading, [`user-${userId}`]: true })
    try {
      await axios.put(`/api/admin/users/${userId}`, { is_active: !isActive })
      alert(isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')
      fetchData()
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setActionLoading({ ...actionLoading, [`user-${userId}`]: false })
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn khóa tài khoản này?')) return
    
    setActionLoading({ ...actionLoading, [`delete-${userId}`]: true })
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      alert('Đã khóa tài khoản thành công!')
      fetchData()
    } catch (error) {
      alert('Khóa tài khoản thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setActionLoading({ ...actionLoading, [`delete-${userId}`]: false })
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
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2"></i> Tổng quan
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <i className="bi bi-book"></i> Quản lý khóa học
            {pendingCourses.length > 0 && (
              <span className="badge bg-danger ms-2">{pendingCourses.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people"></i> Quản lý người dùng
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            <i className="bi bi-wallet2"></i> Quản lý tiền
            {pendingDeposits.length > 0 && (
              <span className="badge bg-danger ms-2">{pendingDeposits.length}</span>
            )}
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
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
            <div className="col-md-6 mb-4">
              <div className="card-soft">
                <h5 className="mb-3">
                  <i className="bi bi-book text-brand-sky me-2"></i>Khóa học gần đây
                </h5>
                <div className="list-group">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{course.tieu_de}</strong>
                          <br />
                          <small className="text-muted">{course.cap_do || 'N/A'}</small>
                        </div>
                        <Link
                          to={`/courses/${course.id}`}
                          className="btn btn-sm btn-outline-custom"
                        >
                          Xem
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card-soft">
                <h5 className="mb-3">
                  <i className="bi bi-people text-brand-sky me-2"></i>Người dùng gần đây
                </h5>
                <div className="list-group">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{u.ho_ten}</strong>
                          <br />
                          <small className="text-muted">{u.email}</small>
                        </div>
                        <span className={`badge bg-${u.role === 'teacher' ? 'info' : u.role === 'admin' ? 'danger' : 'secondary'}`}>
                          {u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="row">
          {/* Create/Edit Course Form */}
          {showCreateForm && (
            <div className="col-12 mb-4">
              <div className="card-soft border-primary">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-plus-circle me-2"></i>
                    {editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
                  </h5>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={resetCourseForm}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                <div className="card-body">
                  <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Tên khóa học *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newCourse.tieu_de}
                          onChange={(e) => setNewCourse({ ...newCourse, tieu_de: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Cấp độ</label>
                        <select
                          className="form-select"
                          value={newCourse.cap_do}
                          onChange={(e) => setNewCourse({ ...newCourse, cap_do: e.target.value })}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Mô tả</label>
                        <textarea
                          rows="3"
                          className="form-control"
                          value={newCourse.mo_ta}
                          onChange={(e) => setNewCourse({ ...newCourse, mo_ta: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Giá (VND)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={newCourse.gia}
                          onChange={(e) => setNewCourse({ ...newCourse, gia: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Giá gốc (VND)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={newCourse.gia_goc || ''}
                          onChange={(e) => setNewCourse({ ...newCourse, gia_goc: e.target.value || null })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Số buổi</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={newCourse.so_buoi}
                          onChange={(e) => setNewCourse({ ...newCourse, so_buoi: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Thời lượng</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ví dụ: 8 tuần, 20 giờ..."
                          value={newCourse.thoi_luong}
                          onChange={(e) => setNewCourse({ ...newCourse, thoi_luong: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Hình thức</label>
                        <select
                          className="form-select"
                          value={newCourse.hinh_thuc}
                          onChange={(e) => setNewCourse({ ...newCourse, hinh_thuc: e.target.value })}
                        >
                          <option value="online">Online</option>
                          <option value="offline">Offline</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Giáo viên</label>
                        <select
                          className="form-select"
                          value={newCourse.teacher_id || ''}
                          onChange={(e) => setNewCourse({ ...newCourse, teacher_id: e.target.value ? Number(e.target.value) : null })}
                        >
                          <option value="">-- Chọn giáo viên --</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.ho_ten} ({teacher.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Link ảnh khóa học</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="https://..."
                          value={newCourse.hinh_anh}
                          onChange={(e) => setNewCourse({ ...newCourse, hinh_anh: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mt-3 d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetCourseForm}
                        disabled={actionLoading.create || actionLoading.update}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={actionLoading.create || actionLoading.update}
                      >
                        {actionLoading.create || actionLoading.update ? 'Đang xử lý...' : editingCourse ? 'Cập nhật' : 'Tạo khóa học'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Button Tạo khóa học */}
          {!showCreateForm && (
            <div className="col-12 mb-3">
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Tạo khóa học mới
              </button>
            </div>
          )}

          {/* Pending Courses */}
          {pendingCourses.length > 0 && (
            <div className="col-12 mb-4">
              <div className="card-soft border-warning">
                <h5 className="mb-3 text-warning">
                  <i className="bi bi-clock-history"></i> Khóa học chờ duyệt ({pendingCourses.length})
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tên khóa học</th>
                        <th>Giáo viên</th>
                        <th>Giá</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCourses.map((course) => (
                        <tr key={course.id}>
                          <td><strong>{course.tieu_de}</strong></td>
                          <td>{course.teacher?.ho_ten || 'N/A'}</td>
                          <td>{new Intl.NumberFormat('vi-VN').format(course.gia)} VNĐ</td>
                          <td>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleApproveCourse(course.id)}
                              disabled={actionLoading[`approve-${course.id}`]}
                            >
                              {actionLoading[`approve-${course.id}`] ? 'Đang xử lý...' : 'Duyệt'}
                            </button>
                            <Link
                              to={`/courses/${course.id}`}
                              className="btn btn-sm btn-outline-custom"
                            >
                              Xem
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* All Courses */}
          <div className="col-12">
            <div className="card-soft">
              <h5 className="mb-3">
                <i className="bi bi-book text-brand-sky me-2"></i>Tất cả khóa học
              </h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Tên khóa học</th>
                      <th>Cấp độ</th>
                      <th>Trạng thái</th>
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
                          <span className={`badge bg-${course.trang_thai === 'active' ? 'success' : course.trang_thai === 'draft' ? 'warning' : 'secondary'}`}>
                            {course.trang_thai === 'active' ? 'Đang hoạt động' : course.trang_thai === 'draft' ? 'Bản nháp' : 'Ngừng hoạt động'}
                          </span>
                        </td>
                        <td>{new Intl.NumberFormat('vi-VN').format(course.gia)} VNĐ</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditCourse(course)}
                              title="Chỉnh sửa"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <select
                              className="form-select form-select-sm"
                              value={course.trang_thai}
                              onChange={(e) => handleUpdateCourseStatus(course.id, e.target.value)}
                              disabled={actionLoading[`status-${course.id}`]}
                            >
                              <option value="active">Đang hoạt động</option>
                              <option value="inactive">Ngừng hoạt động</option>
                              <option value="draft">Bản nháp</option>
                            </select>
                            <Link
                              to={`/courses/${course.id}`}
                              className="btn btn-sm btn-outline-custom"
                            >
                              Xem
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card-soft">
          <h5 className="mb-3">
            <i className="bi bi-people text-brand-sky me-2"></i>Quản lý người dùng
          </h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.ho_ten}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.so_dien_thoai || 'N/A'}</td>
                    <td>
                      <span className={`badge bg-${u.role === 'teacher' ? 'info' : u.role === 'admin' ? 'danger' : 'secondary'}`}>
                        {u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${u.is_active ? 'success' : 'danger'}`}>
                        {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleUpdateUserStatus(u.id, u.is_active)}
                          disabled={actionLoading[`user-${u.id}`] || u.id === user?.id}
                          title={u.id === user?.id ? 'Không thể khóa chính mình' : ''}
                        >
                          {u.is_active ? 'Khóa' : 'Mở khóa'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={actionLoading[`delete-${u.id}`] || u.id === user?.id}
                          title={u.id === user?.id ? 'Không thể xóa chính mình' : ''}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wallet Tab - Quản lý tiền */}
      {activeTab === 'wallet' && (
        <div>
          {/* Tổng doanh thu */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Tổng doanh thu</h5>
                  <h2 className="mb-0">
                    {new Intl.NumberFormat('vi-VN').format(totalRevenue.tong_doanh_thu || 0)} VNĐ
                  </h2>
                  <small>Tổng số giao dịch: {totalRevenue.tong_so_giao_dich || 0}</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-warning text-dark">
                <div className="card-body">
                  <h5 className="card-title">Giao dịch chờ duyệt</h5>
                  <h2 className="mb-0">{pendingDeposits.length}</h2>
                  <small>Giao dịch nạp tiền đang chờ xử lý</small>
                </div>
              </div>
            </div>
          </div>

          {/* Giao dịch chờ duyệt */}
          <div className="card mb-4">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Giao dịch nạp tiền chờ duyệt
              </h5>
              <button 
                className="btn btn-sm btn-light"
                onClick={fetchWalletData}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Làm mới
              </button>
            </div>
            <div className="card-body">
              {pendingDeposits.length === 0 ? (
                <p className="text-muted text-center py-4">Không có giao dịch nào chờ duyệt</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Người dùng</th>
                        <th>Số tiền</th>
                        <th>Nội dung CK</th>
                        <th>Thời gian</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDeposits.map((deposit) => (
                        <tr key={deposit.id}>
                          <td>{deposit.id}</td>
                          <td>
                            <div>
                              <strong>{deposit.user_name || deposit.user_email}</strong>
                              <br />
                              <small className="text-muted">{deposit.user_email}</small>
                            </div>
                          </td>
                          <td>
                            <strong className="text-success">
                              {new Intl.NumberFormat('vi-VN').format(deposit.so_tien)} VNĐ
                            </strong>
                          </td>
                          <td>
                            <code>{deposit.noi_dung_chuyen_khoan}</code>
                          </td>
                          <td>
                            {new Date(deposit.created_at).toLocaleString('vi-VN')}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleApproveDeposit(deposit.id)}
                                disabled={actionLoading[`approve-${deposit.id}`]}
                              >
                                {actionLoading[`approve-${deposit.id}`] ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Duyệt
                                  </>
                                )}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRejectDeposit(deposit.id)}
                                disabled={actionLoading[`reject-${deposit.id}`]}
                              >
                                {actionLoading[`reject-${deposit.id}`] ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <>
                                    <i className="bi bi-x-circle me-1"></i>
                                    Từ chối
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Doanh thu theo khóa học */}
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Doanh thu theo khóa học
              </h5>
            </div>
            <div className="card-body">
              {revenueByCourse.length === 0 ? (
                <p className="text-muted text-center py-4">Chưa có doanh thu</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Khóa học</th>
                        <th>Số lượng giao dịch</th>
                        <th>Tổng doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByCourse.map((item) => (
                        <tr key={item.khoa_hoc_id}>
                          <td>
                            <Link to={`/courses/${item.khoa_hoc_id}`}>
                              {item.tieu_de}
                            </Link>
                          </td>
                          <td>{item.so_luong_giao_dich}</td>
                          <td>
                            <strong className="text-success">
                              {new Intl.NumberFormat('vi-VN').format(item.tong_doanh_thu)} VNĐ
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
