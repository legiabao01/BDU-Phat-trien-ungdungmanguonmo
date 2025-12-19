import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function MySchedule() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/students/my-schedule')
      setSchedules(res.data)
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
      alert('Không thể tải thời khóa biểu: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
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

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'upcoming') return isUpcoming(schedule.ngay_hoc)
    if (filter === 'past') return !isUpcoming(schedule.ngay_hoc)
    return true
  })

  // Nhóm theo ngày
  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    const date = new Date(schedule.ngay_hoc).toLocaleDateString('vi-VN')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(schedule)
    return acc
  }, {})

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
    <div className="container my-5" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="title-gradient mb-0">
          <i className="bi bi-calendar-event me-2"></i> Thời khóa biểu của tôi
        </h1>
        <div className="btn-group">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`btn btn-sm ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('upcoming')}
          >
            Sắp tới
          </button>
          <button
            className={`btn btn-sm ${filter === 'past' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('past')}
          >
            Đã qua
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle me-2"></i>
          Bạn chưa có lịch học nào. Hãy đăng ký khóa học để xem thời khóa biểu.
          <br />
          <Link to="/courses" className="btn btn-primary mt-3">
            Xem khóa học
          </Link>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="alert alert-warning text-center">
          <i className="bi bi-calendar-x me-2"></i>
          Không có lịch học nào trong mục này.
        </div>
      ) : (
        <div>
          {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
            <div key={date} className="mb-4">
              <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                <i className="bi bi-calendar3 text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                <h5 className="mb-0 text-primary fw-bold">{date}</h5>
              </div>
              <div className="row g-3">
                {daySchedules.map((schedule) => {
                  const upcoming = isUpcoming(schedule.ngay_hoc)
                  return (
                    <div key={schedule.id} className="col-lg-6 col-md-12">
                      <div className={`card h-100 shadow-sm ${upcoming ? 'border-primary border-2' : 'border-secondary'}`} style={{ transition: 'all 0.3s ease' }}>
                        <div className={`card-header ${upcoming ? 'bg-primary text-white' : 'bg-secondary text-white'} py-2`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>
                              <i className="bi bi-book me-2"></i>
                              {schedule.tieu_de}
                            </h6>
                            <div>
                              {upcoming && (
                                <span className="badge bg-light text-primary ms-2">
                                  <i className="bi bi-clock me-1"></i>
                                  Sắp tới
                                </span>
                              )}
                              {schedule.is_completed && (
                                <span className="badge bg-success ms-2">Đã hoàn thành</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="card-body p-3">
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-calendar-check text-primary me-2"></i>
                              <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                                {formatDate(schedule.ngay_hoc)}
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

                          {schedule.khoa_hoc && (
                            <div className="mb-3">
                              <i className="bi bi-mortarboard text-info me-2"></i>
                              <span className="small">Khóa học: </span>
                              <Link to={`/courses/${schedule.khoa_hoc_id}`} className="text-decoration-none fw-semibold">
                                {schedule.khoa_hoc.tieu_de}
                              </Link>
                            </div>
                          )}

                          {schedule.ghi_chu && (
                            <div className="alert alert-info py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                              <i className="bi bi-info-circle me-1"></i>
                              <strong>Ghi chú:</strong> {schedule.ghi_chu}
                            </div>
                          )}

                          {upcoming && schedule.link_google_meet && (
                            <div className="d-grid gap-2 mt-3">
                              <a
                                href={schedule.link_google_meet}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-danger fw-semibold"
                                style={{ borderRadius: '8px' }}
                              >
                                <i className="bi bi-camera-video-fill me-2"></i>
                                Vào lớp học ngay (Google Meet)
                              </a>
                              {schedule.link_zoom && (
                                <a
                                  href={schedule.link_zoom}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-info fw-semibold"
                                  style={{ borderRadius: '8px' }}
                                >
                                  <i className="bi bi-camera-video me-2"></i>
                                  Hoặc vào Zoom
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

