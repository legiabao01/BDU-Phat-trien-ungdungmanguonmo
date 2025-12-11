import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import ReviewSection from '../components/ReviewSection'

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState('')

  useEffect(() => {
    fetchCourse()
    fetchLessons()
    checkEnrollment()
  }, [id, user])

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`)
      setCourse(response.data)
    } catch (error) {
      console.error('Failed to fetch course:', error)
    }
  }

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}/lessons`)
      const sortedLessons = response.data.sort((a, b) => a.thu_tu - b.thu_tu)
      setLessons(sortedLessons)
      if (sortedLessons.length > 0) {
        setSelectedLesson(sortedLessons[0])
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollment = async () => {
    if (!user) return
    try {
      const response = await axios.get(`/api/courses/${id}/enrollment`)
      setIsEnrolled(response.data.is_enrolled)
    } catch (error) {
      console.error('Failed to check enrollment:', error)
      setIsEnrolled(false)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      setEnrollError('Vui lòng đăng nhập để đăng ký khóa học')
      setTimeout(() => setEnrollError(''), 3000)
      return
    }

    setEnrolling(true)
    setEnrollError('')
    
    try {
      await axios.post(`/api/courses/${id}/enroll`)
      setIsEnrolled(true)
      // Hiển thị thông báo thành công và redirect
      alert('Đăng ký khóa học thành công! Đang chuyển đến trang học...')
      window.location.href = `/learn/${id}`
    } catch (error) {
      const message = error.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.'
      setEnrollError(message)
      setTimeout(() => setEnrollError(''), 5000)
      console.error('Failed to enroll:', error)
    } finally {
      setEnrolling(false)
    }
  }

  const getVideoEmbedUrl = (videoPath) => {
    if (!videoPath) return null
    
    if (videoPath.includes('youtube.com') || videoPath.includes('youtu.be')) {
      const videoId = videoPath.includes('v=') 
        ? videoPath.split('v=')[1].split('&')[0]
        : videoPath.split('/').pop()
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    if (videoPath.includes('vimeo.com')) {
      const videoId = videoPath.split('/').pop()
      return `https://player.vimeo.com/video/${videoId}`
    }
    
    return videoPath
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

  if (!course) {
    return <div className="container my-5">Khóa học không tồn tại</div>
  }

  return (
    <div className="container my-5">
      {/* Course Header */}
      <div className="card-soft mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h1 className="title-gradient mb-2">{course.tieu_de}</h1>
            <p className="text-muted mb-3">{course.mo_ta || 'Không có mô tả'}</p>
            <div className="d-flex gap-2 flex-wrap mb-3">
              <span className="badge-custom badge-info">
                <i className="bi bi-star"></i> {course.cap_do || 'N/A'}
              </span>
              <span className="badge-custom badge-success">
                <i className="bi bi-laptop"></i> {course.hinh_thuc || 'online'}
              </span>
              <span className="badge-custom badge-primary">
                <i className="bi bi-calendar-check"></i> {course.so_buoi || 0} buổi học
              </span>
            </div>
            <div className="d-flex gap-2 flex-column">
              {enrollError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-circle"></i> {enrollError}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEnrollError('')}
                  ></button>
                </div>
              )}
              {isEnrolled ? (
                <Link
                  to={`/learn/${id}`}
                  className="btn btn-primary-custom"
                >
                  <i className="bi bi-play-circle"></i> Vào học
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="btn btn-primary-custom"
                  disabled={!user || enrolling}
                >
                  {enrolling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang đăng ký...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus"></i> Đăng ký khóa học
                    </>
                  )}
                </button>
              )}
              {!user && (
                <Link to="/login" className="btn btn-outline-custom">
                  <i className="bi bi-box-arrow-in-right"></i> Đăng nhập để đăng ký
                </Link>
              )}
              <Link to="/courses" className="btn btn-outline-custom">
                <i className="bi bi-arrow-left"></i> Quay lại
              </Link>
            </div>
          </div>
          <div className="col-md-4 text-end">
            <div className="card border-0 bg-light p-3">
              <h5 className="mb-3">Giá khóa học</h5>
              <p className="h3 text-brand-green mb-0">
                {new Intl.NumberFormat('vi-VN').format(course.gia)} VNĐ
              </p>
              {course.gia_goc && course.gia_goc > course.gia && (
                <p className="text-muted text-decoration-line-through small mb-0">
                  {new Intl.NumberFormat('vi-VN').format(course.gia_goc)} VNĐ
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar - Lesson Tree */}
        <div className="col-lg-3 mb-4">
          <div className="card-soft sticky-top" style={{ top: '20px' }}>
            <h5 className="mb-3">Chương trình học</h5>
            <div className="list-group list-group-flush">
              {lessons.length === 0 ? (
                <p className="text-muted small">Chưa có bài học</p>
              ) : (
                lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`list-group-item list-group-item-action ${
                      selectedLesson?.id === lesson.id ? 'active' : ''
                    } ${!lesson.is_unlocked ? 'opacity-50' : ''}`}
                    disabled={!lesson.is_unlocked}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-play-circle me-2"></i>
                        Bài {lesson.thu_tu}: {lesson.tieu_de_muc}
                      </span>
                      {!lesson.is_unlocked && <i className="bi bi-lock"></i>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          <div className="card-soft">
            {selectedLesson ? (
              <div>
                <h2 className="title-gradient mb-4">
                  <i className="bi bi-play-circle-fill text-brand-green me-2"></i>
                  {selectedLesson.tieu_de_muc}
                </h2>

                {/* Video Player */}
                {selectedLesson.video_path && (
                  <div className="mb-4">
                    <div className="ratio ratio-16x9">
                      {(() => {
                        const videoUrl = getVideoEmbedUrl(selectedLesson.video_path)
                        if (videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be')) {
                          return (
                            <iframe
                              src={videoUrl}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          )
                        } else if (videoUrl?.includes('vimeo.com')) {
                          return (
                            <iframe
                              src={videoUrl}
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          )
                        } else {
                          return (
                            <video controls className="w-100 rounded shadow-sm" style={{ maxHeight: '500px' }}>
                              <source src={videoUrl} type="video/mp4" />
                              Trình duyệt của bạn không hỗ trợ video tag.
                            </video>
                          )
                        }
                      })()}
                    </div>
                    {selectedLesson.video_duration && (
                      <small className="text-muted">
                        <i className="bi bi-clock"></i> Thời lượng:{' '}
                        {Math.floor(selectedLesson.video_duration / 60)}:
                        {String(selectedLesson.video_duration % 60).padStart(2, '0')}
                      </small>
                    )}
                  </div>
                )}

                {/* Lesson Content */}
                {selectedLesson.noi_dung && (
                  <div className="prose">
                    <div className="text-muted" dangerouslySetInnerHTML={{ __html: selectedLesson.noi_dung.replace(/\n/g, '<br />') }}></div>
                  </div>
                )}

                {!selectedLesson.video_path && !selectedLesson.noi_dung && (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle"></i> Bài học này chưa có nội dung.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-book text-muted" style={{ fontSize: '4rem' }}></i>
                <p className="text-muted mt-3">Chọn bài học để xem</p>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="card-soft mt-4">
            <ReviewSection courseId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
