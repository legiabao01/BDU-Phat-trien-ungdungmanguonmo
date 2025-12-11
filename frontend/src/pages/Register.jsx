import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ho_ten: '',
    so_dien_thoai: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await register(
      formData.email,
      formData.password,
      formData.ho_ten,
      formData.so_dien_thoai
    )
    if (result.success) {
      navigate('/login')
    } else {
      setError(result.error)
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
              <span className="gradient-text">Code Dạo</span>
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
                  <h2 className="title-gradient mb-2">Đăng ký</h2>
                  <p className="text-muted">Tạo tài khoản mới để bắt đầu học</p>
                </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="ho_ten" className="form-label">
                    Họ tên
                  </label>
                  <input
                    id="ho_ten"
                    name="ho_ten"
                    type="text"
                    required
                    value={formData.ho_ten}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="example@email.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="so_dien_thoai" className="form-label">
                    Số điện thoại <span className="text-muted">(tùy chọn)</span>
                  </label>
                  <input
                    id="so_dien_thoai"
                    name="so_dien_thoai"
                    type="tel"
                    value={formData.so_dien_thoai}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="0901234567"
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
                    value={formData.password}
                    onChange={handleChange}
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
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng ký'
                  )}
                </button>

                <div className="text-center">
                  <span className="text-muted">Đã có tài khoản? </span>
                  <Link to="/login" className="text-brand-sky text-decoration-none">
                    Đăng nhập
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



