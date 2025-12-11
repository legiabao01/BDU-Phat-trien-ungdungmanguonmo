import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function ReviewSection({ courseId }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    diem: 5,
    noi_dung: ''
  })

  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [courseId])

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/reviews`)
      setReviews(response.data)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/reviews/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch review stats:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá')
      return
    }

    setSubmitting(true)
    try {
      await axios.post(`/api/courses/${courseId}/reviews`, formData)
      setFormData({ diem: 5, noi_dung: '' })
      fetchReviews()
      fetchStats()
      alert('Đánh giá thành công!')
    } catch (error) {
      const message = error.response?.data?.detail || 'Đánh giá thất bại'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`bi ${i < rating ? 'bi-star-fill text-warning' : 'bi-star'}`}
      />
    ))
  }

  if (loading) {
    return <div className="text-center py-4">Đang tải đánh giá...</div>
  }

  return (
    <div className="mt-4">
      <h5 className="mb-4">
        <i className="bi bi-star-fill text-warning"></i> Đánh giá khóa học
      </h5>

      {/* Stats */}
      {stats && (
        <div className="card-soft mb-4">
          <div className="row align-items-center">
            <div className="col-md-4 text-center">
              <h2 className="mb-0 text-primary">{stats.average_rating.toFixed(1)}</h2>
              <div className="mb-2">{renderStars(Math.round(stats.average_rating))}</div>
              <small className="text-muted">{stats.total_reviews} đánh giá</small>
            </div>
            <div className="col-md-8">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="d-flex align-items-center mb-2">
                  <small className="me-2" style={{ width: '30px' }}>{star} sao</small>
                  <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{
                        width: `${stats.total_reviews > 0 ? (stats.rating_distribution[star] / stats.total_reviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <small className="text-muted" style={{ width: '40px' }}>
                    {stats.rating_distribution[star] || 0}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {user && (
        <div className="card-soft mb-4">
          <h6 className="mb-3">Viết đánh giá của bạn</h6>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Đánh giá sao</label>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => setFormData({ ...formData, diem: star })}
                    style={{ fontSize: '24px', color: star <= formData.diem ? '#ffc107' : '#ccc' }}
                  >
                    <i className="bi bi-star-fill"></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Nội dung đánh giá</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary-custom"
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h6 className="mb-3">Tất cả đánh giá ({reviews.length})</h6>
        {reviews.length === 0 ? (
          <div className="text-center py-4 text-muted">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="card-soft mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <strong>{review.user_name || 'Người dùng'}</strong>
                  <div className="mt-1">{renderStars(review.diem)}</div>
                </div>
                <small className="text-muted">
                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                </small>
              </div>
              {review.noi_dung && (
                <p className="mb-0">{review.noi_dung}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

