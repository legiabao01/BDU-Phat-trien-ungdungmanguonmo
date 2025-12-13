import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import ChatWidget from './ChatWidget'
import Footer from './Footer'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Navigation - Migrated from base.html */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg z-50 border-b border-gray-100">
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/courses">
              <span className="gradient-text">Code Đơ</span>
            </Link>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto d-flex flex-row gap-3">
                <li className="nav-item">
                  <Link className="nav-link" to="/courses">Trang chủ</Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/courses?scroll=true"
                    onClick={(e) => {
                      // Nếu đang ở trang courses, scroll xuống phần "Tất cả khóa học"
                      if (window.location.pathname === '/courses') {
                        e.preventDefault()
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
                          }
                        }, 100)
                      }
                    }}
                  >
                    Khóa học
                  </Link>
                </li>
                {user && user.vai_tro === 'student' && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link px-3 py-2 rounded bg-gradient-sky-green-light text-brand-sky fw-semibold border border-brand-sky-200" 
                      to="/dashboard"
                    >
                      <i className="bi bi-book"></i> Khóa học của tôi
                    </Link>
                  </li>
                )}
                {user && user.vai_tro === 'teacher' && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link px-3 py-2 rounded bg-gradient-sky-green-light text-brand-sky fw-semibold border border-brand-sky-200" 
                      to="/dashboard"
                    >
                      <i className="bi bi-book"></i> Lớp học của tôi
                    </Link>
                  </li>
                )}
              </ul>
              <ul className="navbar-nav d-flex flex-row align-items-center gap-2">
                {user ? (
                  <>
                    <li className="nav-item">
                      <NotificationBell />
                    </li>
                    <li className="nav-item">
                      <Link 
                        className="nav-link px-3 py-2 rounded" 
                        to="/addfunds"
                        style={{ 
                          backgroundColor: '#2563eb',
                          color: '#000000',
                          fontWeight: 'bold'
                        }}
                      >
                        <i className="bi bi-wallet2 me-2"></i>
                        Số dư {new Intl.NumberFormat('vi-VN').format(user.so_du || 0)} VND
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-brand-sky" to="/profile">
                        <i className="bi bi-person-circle"></i> {user.ho_ten}
                      </Link>
                    </li>
                    {user.vai_tro === 'admin' && (
                      <li className="nav-item">
                        <Link 
                          className="nav-link px-3 py-1 rounded border border-gray-200 text-sm text-gray-600" 
                          to="/dashboard"
                        >
                          Quản trị viên
                        </Link>
                      </li>
                    )}
                    {user.vai_tro === 'teacher' && (
                      <li className="nav-item">
                        <Link 
                          className="nav-link px-3 py-1 rounded border border-gray-200 text-sm text-gray-600" 
                          to="/dashboard"
                        >
                          Giáo viên
                        </Link>
                      </li>
                    )}
                    <li className="nav-item">
                      <button 
                        className="nav-link text-gray-700 border-0 bg-transparent" 
                        onClick={handleLogout}
                        style={{ cursor: 'pointer' }}
                      >
                        Đăng xuất
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <Link className="btn btn-primary-custom" to="/login">
                      Đăng nhập
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      {user && <ChatWidget />}
    </>
  )
}
