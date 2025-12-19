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
    try {
      const date = new Date(dateStr)
      // Thử format với locale vi-VN, nếu không được thì dùng fallback
      const formatted = date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      // Kiểm tra xem có ký tự lạ không (dấu hiệu encoding sai)
      if (formatted.includes('?') || formatted.length < 10) {
        // Fallback: format thủ công
        const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
        const months = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12']
        const weekday = weekdays[date.getDay()]
        const day = date.getDate()
        const month = months[date.getMonth()]
        const year = date.getFullYear()
        return `${weekday}, ${day} ${month}, ${year}`
      }
      return formatted
    } catch (error) {
      // Fallback nếu có lỗi
      const date = new Date(dateStr)
      const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
      const months = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12']
      const weekday = weekdays[date.getDay()]
      const day = date.getDate()
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${weekday}, ${day} ${month}, ${year}`
    }
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
    <div className="container my-5 schedule-container">
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
              <div className="schedule-date-header d-flex align-items-center">
                <i className="bi bi-calendar3 me-2" style={{ fontSize: '1.5rem' }}></i>
                <span>{date}</span>
              </div>
              <div className="row g-3">
                {daySchedules.map((schedule) => {
                  const upcoming = isUpcoming(schedule.ngay_hoc)
                  return (
                    <div key={schedule.id} className="col-lg-6 col-md-12">
                      <div className={`card h-100 schedule-card ${upcoming ? 'upcoming' : ''}`}>
                        <div className={`card-header schedule-card-header ${upcoming ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">
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
                              <span className="fw-semibold">
                                {formatDate(schedule.ngay_hoc)}
                              </span>
                            </div>
                            {schedule.thoi_gian_bat_dau && schedule.thoi_gian_ket_thuc ? (
                              <div className="d-flex align-items-center">
                                <i className="bi bi-clock text-success me-2"></i>
                                <span className="schedule-time-badge">
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
                          
                          {schedule.khoa_hoc && (
                            <div className="mb-3">
                              <i className="bi bi-mortarboard text-info me-2"></i>
                              <span className="small">Khóa học: </span>
                              <Link to={`/courses/${schedule.khoa_hoc_id}`} className="text-decoration-none fw-semibold">
                                {schedule.khoa_hoc.tieu_de}
                              </Link>
                            </div>
                          )}

                          {upcoming && schedule.link_google_meet && (
                            <div className="d-grid gap-2 mt-3">
                              <a
                                href={schedule.link_google_meet}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-danger fw-semibold schedule-join-btn"
                              >
                                <i className="bi bi-camera-video-fill me-2"></i>
                                Vào lớp học ngay (Google Meet)
                              </a>
                              {schedule.link_zoom && (
                                <a
                                  href={schedule.link_zoom}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-info fw-semibold schedule-join-btn"
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

