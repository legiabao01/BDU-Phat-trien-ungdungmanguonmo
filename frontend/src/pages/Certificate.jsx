import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Certificate() {
  const { id: courseId } = useParams()
  const { user } = useAuth()
  const [certificate, setCertificate] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCertificate()
  }, [courseId])

  const fetchCertificate = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/certificate`)
      setCertificate(response.data)
      
      // Fetch course info
      const courseResponse = await axios.get(`/api/courses/${courseId}`)
      setCourse(courseResponse.data)
    } catch (error) {
      if (error.response?.status === 400) {
        setError(error.response.data.detail)
      } else {
        setError('Không thể tải chứng nhận')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      const response = await axios.post(`/api/courses/${courseId}/complete`)
      alert('Chúc mừng! Bạn đã hoàn thành khóa học!')
      fetchCertificate()
    } catch (error) {
      alert(error.response?.data?.detail || 'Không thể đánh dấu hoàn thành')
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

  if (error) {
    return (
      <div className="container my-5">
        <div className="card-soft">
          <div className="alert alert-warning">
            <h5><i className="bi bi-exclamation-triangle"></i> {error}</h5>
            <p>Bạn cần hoàn thành 100% khóa học để nhận chứng nhận.</p>
            <Link to={`/learn/${courseId}`} className="btn btn-primary-custom">
              <i className="bi bi-arrow-left"></i> Tiếp tục học
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Certificate Card */}
          <div className="card-soft border border-success border-3">
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-award-fill text-warning" style={{ fontSize: '5rem' }}></i>
              </div>
              
              <h2 className="title-gradient mb-3">Chứng Nhận Hoàn Thành</h2>
              
              <div className="mb-4">
                <p className="lead">Chứng nhận này xác nhận rằng</p>
                <h3 className="text-primary mb-3">{user?.ho_ten || 'Học viên'}</h3>
                <p className="lead">đã hoàn thành thành công khóa học</p>
                <h4 className="text-brand-green mb-4">{course?.tieu_de || certificate?.course_title}</h4>
              </div>

              <div className="border-top border-bottom py-4 my-4">
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted d-block">Mã chứng nhận</small>
                    <strong className="text-monospace">{certificate?.certificate_code}</strong>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Ngày cấp</small>
                    <strong>
                      {certificate?.issued_at 
                        ? new Date(certificate.issued_at).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-primary-custom me-2"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer"></i> In chứng nhận
                </button>
                <Link to="/dashboard" className="btn btn-outline-custom">
                  <i className="bi bi-house"></i> Về Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="card-soft mt-4">
            <h5><i className="bi bi-info-circle"></i> Thông tin chứng nhận</h5>
            <ul className="list-unstyled">
              <li><strong>Học viên:</strong> {user?.ho_ten}</li>
              <li><strong>Email:</strong> {user?.email}</li>
              <li><strong>Khóa học:</strong> {course?.tieu_de}</li>
              <li><strong>Mã chứng nhận:</strong> {certificate?.certificate_code}</li>
              <li><strong>Ngày cấp:</strong> {
                certificate?.issued_at 
                  ? new Date(certificate.issued_at).toLocaleString('vi-VN')
                  : 'N/A'
              }</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}



