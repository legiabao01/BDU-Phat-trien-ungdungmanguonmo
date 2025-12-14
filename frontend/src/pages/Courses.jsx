import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0
  })
  
  // Filter states
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [mode, setMode] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    fetchCourses()
    fetchStats()
  }, [level, mode, sort])

  useEffect(() => {
    // Scroll to all-courses section if coming from header link
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('scroll') === 'true') {
      setTimeout(() => {
        const element = document.getElementById('all-courses')
        if (element) {
          const headerOffset = 80
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
          // Remove scroll param from URL
          window.history.replaceState({}, '', '/courses')
        }
      }, 300)
    }
  }, [])

  const fetchStats = async () => {
    try {
      const [coursesRes] = await Promise.all([
        axios.get('/api/courses')
      ])
      // Đảm bảo coursesRes.data là array
      const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : []
      
      setStats({
        totalCourses: coursesData.length || 0,
        totalStudents: 150, // Placeholder
        totalTeachers: 25 // Placeholder
      })
      
      // Get featured courses (first 3)
      setFeaturedCourses(coursesData.slice(0, 3))
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Đảm bảo featuredCourses luôn là array
      setFeaturedCourses([])
    }
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('q', search)
      if (level) params.append('cap_do', level)
      if (mode) params.append('hinh_thuc', mode)
      if (sort) params.append('sort', sort)

      const response = await axios.get(`/api/courses?${params.toString()}`)
      // Đảm bảo response.data là array trước khi set
      const coursesData = Array.isArray(response.data) ? response.data : []
      setCourses(coursesData)
      setError('')
    } catch (error) {
      setError('Không thể tải danh sách khóa học')
      console.error(error)
      // Đảm bảo courses luôn là array ngay cả khi có lỗi
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses()
  }

  const handleFilterChange = () => {
    fetchCourses()
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
    <>
      {/* Hero Section */}
      <div className="hero-section position-relative overflow-hidden">
        <div className="hero-background"></div>
        <div className="container position-relative" style={{ paddingTop: '120px', paddingBottom: '80px', zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="hero-title mb-4">
                Học lập trình <span className="gradient-text">chuyên nghiệp</span> cùng Code Đơ
              </h1>
              <p className="hero-subtitle mb-4">
                Nền tảng học trực tuyến hàng đầu với các khóa học chất lượng cao, 
                giảng viên giàu kinh nghiệm và cộng đồng học viên năng động.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link 
                  to="#all-courses" 
                  className="btn btn-hero-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.getElementById('all-courses')
                    if (element) {
                      const headerOffset = 80
                      const elementPosition = element.getBoundingClientRect().top
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      })
                    }
                  }}
                >
                  <i className="bi bi-book me-2"></i>
                  Khám phá khóa học
                </Link>
                {!user && (
                  <Link to="/register" className="btn btn-hero-outline">
                    <i className="bi bi-person-plus me-2"></i>
                    Đăng ký ngay
                  </Link>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <div className="hero-illustration">
                <i className="bi bi-code-square" style={{ fontSize: '12rem', color: 'rgba(6, 182, 212, 0.2)' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="stat-card text-center">
                <div className="stat-icon mb-3">
                  <i className="bi bi-book-fill"></i>
                </div>
                <h3 className="stat-number mb-2">{stats.totalCourses}+</h3>
                <p className="stat-label">Khóa học</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card text-center">
                <div className="stat-icon mb-3">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h3 className="stat-number mb-2">{stats.totalStudents}+</h3>
                <p className="stat-label">Học viên</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card text-center">
                <div className="stat-icon mb-3">
                  <i className="bi bi-person-badge-fill"></i>
                </div>
                <h3 className="stat-number mb-2">{stats.totalTeachers}+</h3>
                <p className="stat-label">Giảng viên</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title mb-3">Tại sao chọn Code Đơ?</h2>
            <p className="section-subtitle text-muted">Nền tảng học tập hiện đại với nhiều ưu điểm vượt trội</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon mb-3">
                  <i className="bi bi-play-circle-fill"></i>
                </div>
                <h4 className="feature-title mb-3">Học mọi lúc mọi nơi</h4>
                <p className="feature-text">
                  Truy cập khóa học từ bất kỳ đâu, bất kỳ lúc nào. Học theo tốc độ của riêng bạn.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon mb-3">
                  <i className="bi bi-award-fill"></i>
                </div>
                <h4 className="feature-title mb-3">Chứng chỉ uy tín</h4>
                <p className="feature-text">
                  Nhận chứng chỉ sau khi hoàn thành khóa học, được công nhận bởi các nhà tuyển dụng.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon mb-3">
                  <i className="bi bi-chat-dots-fill"></i>
                </div>
                <h4 className="feature-title mb-3">Hỗ trợ 24/7</h4>
                <p className="feature-text">
                  Đội ngũ giảng viên và cộng đồng luôn sẵn sàng hỗ trợ bạn trong quá trình học tập.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon mb-3">
                  <i className="bi bi-file-earmark-code-fill"></i>
                </div>
                <h4 className="feature-title mb-3">Thực hành thực tế</h4>
                <p className="feature-text">
                  Bài tập và dự án thực tế giúp bạn áp dụng kiến thức ngay sau khi học.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon mb-3">
                  <i className="bi bi-currency-exchange"></i>
                </div>
                <h4 className="feature-title mb-3">Giá cả hợp lý</h4>
                <p className="feature-text">
                  Mức giá phù hợp với chất lượng, nhiều khóa học miễn phí và ưu đãi hấp dẫn.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon mb-3">
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <h4 className="feature-title mb-3">Theo dõi tiến độ</h4>
                <p className="feature-text">
                  Dashboard cá nhân giúp bạn theo dõi tiến độ học tập và hoàn thành khóa học.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <div className="featured-courses-section py-5">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="section-title mb-3">Khóa học nổi bật</h2>
              <p className="section-subtitle text-muted">Các khóa học được yêu thích nhất</p>
            </div>
            <div className="row g-4">
              {featuredCourses.map((course) => (
                <div key={course.id} className="col-md-4">
                  <div className="course-card h-100 featured-course">
                    {course.hinh_anh ? (
                      <img
                        src={course.hinh_anh}
                        className="course-card-img"
                        alt={course.tieu_de}
                      />
                    ) : (
                      <div className="course-card-img bg-secondary d-flex align-items-center justify-content-center">
                        <i className="bi bi-book text-white" style={{ fontSize: '4rem' }}></i>
                      </div>
                    )}
                    <div className="course-card-body">
                      <h5 className="course-card-title">{course.tieu_de}</h5>
                      <p className="course-card-text">
                        {course.mo_ta
                          ? course.mo_ta.length > 100
                            ? course.mo_ta.substring(0, 100) + '...'
                            : course.mo_ta
                          : 'Không có mô tả'}
                      </p>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge-custom badge-info">
                          {course.cap_do || 'N/A'}
                        </span>
                        <span className="badge-custom badge-success text-uppercase">
                          {course.hinh_thuc || 'online'}
                        </span>
                      </div>
                      <div className="mt-auto">
                        <p className="course-card-price mb-3">
                          {new Intl.NumberFormat('vi-VN').format(course.gia)} VNĐ
                        </p>
                        <Link
                          to={`/courses/${course.id}`}
                          className="btn btn-primary-custom w-100"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-5">
              <Link to="#all-courses" 
                className="btn btn-outline-primary-custom"
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById('all-courses')
                  if (element) {
                    const headerOffset = 80
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    })
                  }
                }}
              >
                Xem tất cả khóa học <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* All Courses Section */}
      <div className="bg-gradient-sky-green text-white py-5 position-relative overflow-hidden" id="all-courses" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="position-absolute top-0 left-0 w-100 h-100" style={{ 
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        <div className="container text-center position-relative">
          <h2 className="display-5 fw-bold mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Tất cả khóa học</h2>
          <p className="lead fs-5" style={{ opacity: 0.95 }}>Khám phá các chương trình học toàn diện cho mọi trình độ</p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="container my-5" style={{ paddingTop: '2rem' }}>
        {/* Search and Filter */}
        <div className="row mb-5 g-3 align-items-center">
          <div className="col-lg-5">
            <form onSubmit={handleSearch}>
              <div className="input-group input-group-lg">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm khóa học..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-primary-custom" type="submit">
                  <i className="bi bi-search"></i> Tìm kiếm
                </button>
              </div>
            </form>
          </div>
          <div className="col-lg-2">
            <select
              className="form-select form-select-lg"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value)
                handleFilterChange()
              }}
            >
              <option value="">Tất cả cấp độ</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="col-lg-2">
            <select
              className="form-select form-select-lg"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value)
                handleFilterChange()
              }}
            >
              <option value="">Hình thức</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="col-lg-3">
            <select
              className="form-select form-select-lg"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                handleFilterChange()
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Courses List */}
        {error ? (
          <div className="alert alert-danger text-center">
            <i className="bi bi-exclamation-circle"></i> {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="alert alert-info text-center">
            <i className="bi bi-info-circle"></i> Không tìm thấy khóa học nào.
          </div>
        ) : (
          <div className="row g-4">
            {courses.map((course) => (
              <div key={course.id} className="col-md-4">
                <div className="course-card h-100">
                  {course.hinh_anh ? (
                    <img
                      src={course.hinh_anh}
                      className="course-card-img"
                      alt={course.tieu_de}
                    />
                  ) : (
                    <div className="course-card-img bg-secondary d-flex align-items-center justify-content-center">
                      <i className="bi bi-book text-white" style={{ fontSize: '4rem' }}></i>
                    </div>
                  )}
                  <div className="course-card-body">
                    <h5 className="course-card-title">{course.tieu_de}</h5>
                    <p className="course-card-text">
                      {course.mo_ta
                        ? course.mo_ta.length > 120
                          ? course.mo_ta.substring(0, 120) + '...'
                          : course.mo_ta
                        : 'Không có mô tả'}
                    </p>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge-custom badge-info">
                        {course.cap_do || 'N/A'}
                      </span>
                      <span className="badge-custom badge-success text-uppercase">
                        {course.hinh_thuc || 'online'}
                      </span>
                    </div>
                    <div className="d-flex align-items-center text-muted small mb-2">
                      <i className="bi bi-calendar-check me-1"></i>
                      {course.so_buoi || 0} buổi
                    </div>
                    <div className="mt-auto">
                      <p className="course-card-price mb-3">
                        {new Intl.NumberFormat('vi-VN').format(course.gia)} VNĐ
                      </p>
                      <Link
                        to={`/courses/${course.id}`}
                        className="btn btn-primary-custom w-100"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
