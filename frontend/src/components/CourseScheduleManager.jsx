import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function CourseScheduleManager({ courseId, courseTitle }) {
  const { user } = useAuth()
  const userRole = user?.role || user?.vai_tro
  const isTeacher = userRole === 'teacher'
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [formData, setFormData] = useState({
    tieu_de: '',
    mo_ta: '',
    ngay_hoc: '',
    thoi_gian_bat_dau: '',
    thoi_gian_ket_thuc: '',
    link_google_meet: '',
    link_zoom: '',
    link_khac: '',
    ghi_chu: ''
  })

  useEffect(() => {
    fetchSchedules()
  }, [courseId])

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/courses/${courseId}/schedule`)
      setSchedules(res.data)
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
      alert('Không thể tải thời khóa biểu: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        khoa_hoc_id: courseId,
        ngay_hoc: new Date(formData.ngay_hoc).toISOString()
      }

      if (editingSchedule) {
        await axios.put(`/api/schedule/${editingSchedule.id}`, payload)
        alert('Cập nhật lịch học thành công!')
      } else {
        await axios.post(`/api/courses/${courseId}/schedule`, payload)
        alert('Tạo lịch học thành công!')
      }
      
      resetForm()
      fetchSchedules()
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    const date = new Date(schedule.ngay_hoc)
    const dateStr = date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    setFormData({
      tieu_de: schedule.tieu_de || '',
      ngay_hoc: dateStr,
      thoi_gian_bat_dau: schedule.thoi_gian_bat_dau || '',
      thoi_gian_ket_thuc: schedule.thoi_gian_ket_thuc || '',
      link_google_meet: schedule.link_google_meet || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch học này?')) return
    
    try {
      await axios.delete(`/api/schedule/${scheduleId}`)
      alert('Đã xóa lịch học thành công!')
      fetchSchedules()
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.detail || error.message))
    }
  }

  const resetForm = () => {
    setFormData({
      tieu_de: '',
      ngay_hoc: '',
      thoi_gian_bat_dau: '',
      thoi_gian_ket_thuc: '',
      link_google_meet: ''
    })
    setEditingSchedule(null)
    setShowForm(false)
  }

  const formatDateOnly = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUpcoming = (dateStr) => {
    return new Date(dateStr) > new Date()
  }

  if (loading) {
    return <div className="text-center py-4"><div className="spinner-border"></div></div>
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <i className="bi bi-calendar-event me-2"></i>
          Thời khóa biểu - {courseTitle}
        </h5>
        {isTeacher && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Thêm lịch học
          </button>
        )}
      </div>

      {/* Form tạo/chỉnh sửa */}
      {showForm && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white d-flex justify-content-between">
            <h6 className="mb-0">
              {editingSchedule ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}
            </h6>
            <button className="btn btn-sm btn-light" onClick={resetForm}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">Tiêu đề buổi học *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.tieu_de}
                    onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                    required
                    placeholder="Ví dụ: Buổi 1 - Giới thiệu Python"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày giờ học *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.ngay_hoc}
                    onChange={(e) => setFormData({ ...formData, ngay_hoc: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Giờ bắt đầu</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.thoi_gian_bat_dau}
                    onChange={(e) => setFormData({ ...formData, thoi_gian_bat_dau: e.target.value })}
                    placeholder="19:00"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Giờ kết thúc</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.thoi_gian_ket_thuc}
                    onChange={(e) => setFormData({ ...formData, thoi_gian_ket_thuc: e.target.value })}
                    placeholder="21:00"
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">
                    <i className="bi bi-camera-video-fill text-danger me-1"></i>
                    Link Google Meet *
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.link_google_meet}
                    onChange={(e) => setFormData({ ...formData, link_google_meet: e.target.value })}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    required
                  />
                </div>
              </div>
              <div className="mt-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSchedule ? 'Cập nhật' : 'Tạo lịch học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách lịch học */}
      {schedules.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Chưa có lịch học nào. Hãy thêm lịch học để học sinh biết khi nào học.
        </div>
      ) : (
        <div className="row g-3">
          {schedules.map((schedule) => {
            const upcoming = isUpcoming(schedule.ngay_hoc)
            return (
              <div key={schedule.id} className="col-lg-6 col-md-12">
                <div className={`card h-100 shadow-sm ${upcoming ? 'border-primary border-2' : 'border-secondary'}`} style={{ transition: 'all 0.3s ease' }}>
                  <div className={`card-header ${upcoming ? 'bg-primary text-white' : 'bg-secondary text-white'} py-2`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>
                        <i className="bi bi-calendar3 me-2"></i>
                        {schedule.tieu_de}
                      </h6>
                      {schedule.is_completed && (
                        <span className="badge bg-success">Đã hoàn thành</span>
                      )}
                    </div>
                  </div>
                  <div className="card-body p-3">
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-calendar-check text-primary me-2"></i>
                        <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                          {formatDateOnly(schedule.ngay_hoc)}
                        </span>
                      </div>
                      {schedule.thoi_gian_bat_dau && schedule.thoi_gian_ket_thuc ? (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-clock text-success me-2"></i>
                          <span className="badge bg-success-subtle text-success-emphasis px-3 py-2" style={{ fontSize: '0.9rem' }}>
                            <strong>{schedule.thoi_gian_bat_dau}</strong> - <strong>{schedule.thoi_gian_ket_thuc}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-clock text-muted me-2"></i>
                          <span className="text-muted small">lúc {formatTime(schedule.ngay_hoc)}</span>
                        </div>
                      )}
                    </div>
                    {schedule.mo_ta && (
                      <p className="text-muted mb-3 small" style={{ lineHeight: '1.6' }}>{schedule.mo_ta}</p>
                    )}
                    {schedule.link_google_meet && (
                      <div className="mb-2">
                        <a
                          href={schedule.link_google_meet}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-danger fw-semibold"
                          style={{ borderRadius: '6px' }}
                        >
                          <i className="bi bi-camera-video-fill me-1"></i>
                          Vào Google Meet
                        </a>
                      </div>
                    )}
                    {schedule.link_zoom && (
                      <div className="mb-2">
                        <a
                          href={schedule.link_zoom}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-info fw-semibold"
                          style={{ borderRadius: '6px' }}
                        >
                          <i className="bi bi-camera-video me-1"></i>
                          Vào Zoom
                        </a>
                      </div>
                    )}
                    {schedule.ghi_chu && (
                      <div className="alert alert-info py-2 mb-0" style={{ fontSize: '0.85rem' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        <strong>Ghi chú:</strong> {schedule.ghi_chu}
                      </div>
                    )}
                  </div>
                  {isTeacher && (
                    <div className="card-footer bg-transparent py-2">
                      <div className="btn-group w-100">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(schedule)}
                          style={{ borderRadius: '6px 0 0 6px' }}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(schedule.id)}
                          style={{ borderRadius: '0 6px 6px 0' }}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

