import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function TeacherGrading() {
  const { courseId, assignmentId } = useParams()
  const { user } = useAuth()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState({})
  const [gradeForm, setGradeForm] = useState({})

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment()
      fetchSubmissions()
    }
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/assignments`)
      const found = response.data.find(a => a.id === parseInt(assignmentId))
      setAssignment(found)
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`/api/assignments/${assignmentId}/submissions`)
      setSubmissions(response.data)
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = async (submissionId) => {
    const form = gradeForm[submissionId]
    if (!form || form.diem === undefined || form.diem === '') {
      alert('Vui lòng nhập điểm')
      return
    }

    setGrading({ ...grading, [submissionId]: true })
    try {
      await axios.post(`/api/submissions/${submissionId}/grade`, {
        diem: parseFloat(form.diem),
        nhan_xet: form.nhan_xet || ''
      })
      alert('Chấm bài thành công!')
      fetchSubmissions()
      setGradeForm({ ...gradeForm, [submissionId]: {} })
    } catch (error) {
      alert('Chấm bài thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setGrading({ ...grading, [submissionId]: false })
    }
  }

  const handleUpdateGrade = (submissionId, field, value) => {
    setGradeForm({
      ...gradeForm,
      [submissionId]: {
        ...gradeForm[submissionId],
        [field]: value
      }
    })
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

  const pendingSubmissions = submissions.filter(s => s.trang_thai === 'submitted')
  const gradedSubmissions = submissions.filter(s => s.trang_thai === 'graded')

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to={`/learn/${courseId}?tab=assignments`} className="btn btn-outline-custom mb-2">
            <i className="bi bi-arrow-left"></i> Quay lại
          </Link>
          <h1 className="title-gradient mb-0">
            <i className="bi bi-file-check"></i> Chấm bài tập
          </h1>
          {assignment && (
            <p className="text-muted mt-2 mb-0">
              {assignment.tieu_de} - Điểm tối đa: {assignment.diem_toi_da || 'N/A'}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card-soft text-center">
            <h3 className="text-primary">{submissions.length}</h3>
            <p className="text-muted mb-0">Tổng bài nộp</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-soft text-center border-warning">
            <h3 className="text-warning">{pendingSubmissions.length}</h3>
            <p className="text-muted mb-0">Chờ chấm</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-soft text-center border-success">
            <h3 className="text-success">{gradedSubmissions.length}</h3>
            <p className="text-muted mb-0">Đã chấm</p>
          </div>
        </div>
      </div>

      {/* Pending Submissions */}
      {pendingSubmissions.length > 0 && (
        <div className="card-soft mb-4 border-warning">
          <h5 className="mb-3 text-warning">
            <i className="bi bi-clock-history"></i> Bài tập chờ chấm ({pendingSubmissions.length})
          </h5>
          <div className="list-group">
            {pendingSubmissions.map((submission) => (
              <div key={submission.id} className="list-group-item">
                <div className="row">
                  <div className="col-md-8">
                    <h6>
                      <i className="bi bi-person-circle"></i> {submission.user?.ho_ten || 'Học viên'}
                    </h6>
                    <p className="mb-2">
                      <strong>Nội dung:</strong>
                      <br />
                      {submission.noi_dung || <span className="text-muted">Không có nội dung</span>}
                    </p>
                    {submission.file_path && (
                      <div className="mb-2">
                        <a
                          href={submission.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-download"></i> Tải file đính kèm
                        </a>
                      </div>
                    )}
                    <small className="text-muted">
                      Nộp lúc: {new Date(submission.created_at).toLocaleString('vi-VN')}
                    </small>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-2">
                      <label className="form-label">Điểm (tối đa: {assignment?.diem_toi_da || 'N/A'})</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.1"
                        min="0"
                        max={assignment?.diem_toi_da || 100}
                        value={gradeForm[submission.id]?.diem || ''}
                        onChange={(e) => handleUpdateGrade(submission.id, 'diem', e.target.value)}
                        placeholder="Nhập điểm"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Nhận xét</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={gradeForm[submission.id]?.nhan_xet || ''}
                        onChange={(e) => handleUpdateGrade(submission.id, 'nhan_xet', e.target.value)}
                        placeholder="Nhận xét cho học viên..."
                      />
                    </div>
                    <button
                      className="btn btn-success w-100"
                      onClick={() => handleGrade(submission.id)}
                      disabled={grading[submission.id]}
                    >
                      {grading[submission.id] ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang chấm...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle"></i> Chấm bài
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graded Submissions */}
      {gradedSubmissions.length > 0 && (
        <div className="card-soft">
          <h5 className="mb-3 text-success">
            <i className="bi bi-check-circle"></i> Bài tập đã chấm ({gradedSubmissions.length})
          </h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Nội dung</th>
                  <th>File</th>
                  <th>Điểm</th>
                  <th>Nhận xét</th>
                  <th>Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                {gradedSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <strong>{submission.user?.ho_ten || 'Học viên'}</strong>
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px' }}>
                        {submission.noi_dung ? (
                          <p className="mb-0 text-truncate" title={submission.noi_dung}>
                            {submission.noi_dung}
                          </p>
                        ) : (
                          <span className="text-muted">Không có nội dung</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {submission.file_path ? (
                        <a
                          href={submission.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-download"></i> Tải
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-success">
                        {submission.diem} / {assignment?.diem_toi_da || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {submission.nhan_xet ? (
                        <p className="mb-0 text-truncate" style={{ maxWidth: '200px' }} title={submission.nhan_xet}>
                          {submission.nhan_xet}
                        </p>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <small>{new Date(submission.created_at).toLocaleDateString('vi-VN')}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {submissions.length === 0 && (
        <div className="card-soft text-center py-5">
          <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
          <p className="text-muted mt-3">Chưa có bài nộp nào</p>
        </div>
      )}
    </div>
  )
}

