import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <nav className="navbar navbar-expand-lg navbar-light bg-white">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/courses">
              <span className="gradient-text">Code Dạo</span>
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
                  <Link className="nav-link" to="/courses">Khóa học</Link>
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
      <main style={{ paddingTop: '80px' }}>
        <Outlet />
      </main>
    </>
  )
}
