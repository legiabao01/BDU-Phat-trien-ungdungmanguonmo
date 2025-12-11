import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    if (result.success) {
      navigate('/courses')
    } else {
      const message =
        typeof result.error === 'string'
          ? result.error
          : result?.error?.detail || 'Đăng nhập thất bại'
      setError(message)
    }
    setLoading(false)
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <nav className="navbar navbar-expand-lg navbar-light bg-white">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/courses">
              <span className="gradient-text">Học Trực Tuyến</span>
            </Link>
            <div className="navbar-nav ms-auto">
              <Link className="nav-link text-brand-sky" to="/courses">
                <i className="bi bi-house"></i> Trang chủ
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="min-h-screen bg-gradient-sky-green d-flex align-items-center justify-content-center py-5" style={{ paddingTop: '80px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="card-soft position-relative">
                <Link 
                  to="/courses" 
                  className="position-absolute top-0 start-0 m-3 text-decoration-none text-muted"
                  style={{ fontSize: '1.5rem' }}
                  title="Về trang chủ"
                >
                  <i className="bi bi-arrow-left-circle"></i>
                </Link>
                <div className="text-center mb-4 pt-3">
                  <h2 className="title-gradient mb-2">Đăng nhập</h2>
                  <p className="text-muted">Nhập thông tin để tiếp tục</p>
                </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Mật khẩu
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>

                <div className="text-center">
                  <span className="text-muted">Chưa có tài khoản? </span>
                  <Link to="/register" className="text-brand-sky text-decoration-none">
                    Đăng ký ngay
                  </Link>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


