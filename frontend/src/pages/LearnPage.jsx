import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import QuizSection from '../components/QuizSection'
import QuizCreator from '../components/QuizCreator'
import CodingPlayground from '../components/CodingPlayground'
import LessonResourcesEditor from '../components/LessonResourcesEditor'
import VideoPlayer from '../components/VideoPlayer'

// Discussion Section Component
function DiscussionSection({ courseId, teacher }) {
  const { user } = useAuth()
  const [discussions, setDiscussions] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [newImage, setNewImage] = useState(null)  // File hình ảnh cho thảo luận mới
  const [replyingTo, setReplyingTo] = useState(null)  // ID của thảo luận đang reply
  const [replyText, setReplyText] = useState('')
  const [replyImage, setReplyImage] = useState(null)  // File hình ảnh cho reply
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiscussions()
  }, [courseId])

  const fetchDiscussions = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/discussions`)
      setDiscussions(response.data)
    } catch (error) {
      console.error('Failed to fetch discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() && !newImage) {
      alert('Vui lòng nhập nội dung hoặc chọn hình ảnh')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.')
        return
      }

      const formData = new FormData()
      // Luôn gửi noi_dung, có thể là chuỗi rỗng nếu chỉ có hình ảnh
      formData.append('noi_dung', newMessage || '')
      // Không gửi parent_id nếu là thảo luận mới (không phải reply)
      if (newImage) {
        formData.append('hinh_anh', newImage)
      }

      await axios.post(`/api/courses/${courseId}/discussions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      setNewMessage('')
      setNewImage(null)
      // Reset file input
      const fileInput = document.getElementById('discussion-image-input')
      if (fileInput) fileInput.value = ''
      fetchDiscussions()
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Gửi tin nhắn thất bại'
      console.error('Error submitting discussion:', error)
      alert('Gửi tin nhắn thất bại: ' + errorMsg)
    }
  }

  const handleReply = async (parentId) => {
    if (!replyText.trim() && !replyImage) {
      alert('Vui lòng nhập nội dung hoặc chọn hình ảnh')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.')
        return
      }

      const formData = new FormData()
      formData.append('noi_dung', replyText || '')
      formData.append('parent_id', parentId.toString())
      if (replyImage) {
        formData.append('hinh_anh', replyImage)
      }

      await axios.post(`/api/courses/${courseId}/discussions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      setReplyText('')
      setReplyImage(null)
      setReplyingTo(null)
      // Reset file input
      const fileInput = document.getElementById(`reply-image-input-${parentId}`)
      if (fileInput) fileInput.value = ''
      fetchDiscussions()
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Gửi trả lời thất bại'
      console.error('Error submitting reply:', error)
      alert('Gửi trả lời thất bại: ' + errorMsg)
    }
  }

  if (loading) {
    return (
      <div className="card-soft mb-4">
        <h3 className="title-gradient mb-4">
          <i className="bi bi-chat-left-text"></i> Thảo luận
        </h3>
        <div className="text-center py-4">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="card-soft mb-4">
      <h3 className="title-gradient mb-4">
        <i className="bi bi-chat-left-text"></i> Thảo luận
      </h3>

      {teacher && (
        <div className="alert alert-info mb-4">
          <i className="bi bi-person-badge"></i> Giáo viên: <strong>{teacher.ho_ten}</strong>
          {teacher.email && (
            <span className="ms-2">
              <a href={`mailto:${teacher.email}`} className="text-decoration-none">
                <i className="bi bi-envelope"></i> {teacher.email}
              </a>
            </span>
          )}
        </div>
      )}

      {/* Form gửi tin nhắn */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-2">
            <textarea
              className="form-control"
              rows="3"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập câu hỏi hoặc bình luận của bạn..."
            ></textarea>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <label htmlFor="discussion-image-input" className="btn btn-sm btn-outline-secondary mb-0" style={{ cursor: 'pointer' }}>
                <i className="bi bi-image"></i> Chọn hình ảnh
              </label>
              <input
                id="discussion-image-input"
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files[0] || null)}
                style={{ display: 'none' }}
              />
              {newImage && (
                <span className="ms-2 text-muted small">
                  <i className="bi bi-check-circle text-success"></i> {newImage.name}
                </span>
              )}
            </div>
            <button className="btn btn-primary-custom" type="submit">
              <i className="bi bi-send"></i> Gửi
            </button>
          </div>
        </form>
      )}

      {/* Danh sách thảo luận */}
      {discussions.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle"></i> Chưa có thảo luận nào. Hãy là người đầu tiên đặt câu hỏi!
        </div>
      ) : (
        <div className="list-group">
          {discussions.map((discussion) => {
            const isTeacher = discussion.user_role === 'teacher' || discussion.user_id === teacher?.id
            const displayName = discussion.user_name || 'Học viên'
            
            return (
            <div key={discussion.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <strong 
                      className={isTeacher ? 'text-danger' : ''}
                      style={isTeacher ? { color: '#dc3545' } : {}}
                    >
                      {displayName}
                      {isTeacher && (
                        <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem' }}>
                          <i className="bi bi-person-badge"></i> Giảng viên
                        </span>
                      )}
                    </strong>
                  <small className="text-muted ms-2">
                    {new Date(discussion.created_at).toLocaleString('vi-VN')}
                  </small>
                </div>
                  {user && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
                    >
                      <i className="bi bi-reply"></i> Trả lời
                    </button>
                  )}
              </div>
                {discussion.noi_dung && <p className="mb-3">{discussion.noi_dung}</p>}
                {discussion.hinh_anh && (
                  <div className="mb-3">
                    <img 
                      src={discussion.hinh_anh} 
                      alt="Hình ảnh đính kèm" 
                      className="img-fluid rounded"
                      style={{ maxWidth: '500px', maxHeight: '400px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
            </div>
                )}
                
                {/* Form reply */}
                {replyingTo === discussion.id && user && (
                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="mb-2">
                      <textarea
                        className="form-control"
                        rows="2"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập câu trả lời của bạn..."
                      ></textarea>
                    </div>
                    <div className="mb-2">
                      <label htmlFor={`reply-image-input-${discussion.id}`} className="btn btn-sm btn-outline-secondary mb-0" style={{ cursor: 'pointer' }}>
                        <i className="bi bi-image"></i> Chọn hình ảnh
                      </label>
                      <input
                        id={`reply-image-input-${discussion.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReplyImage(e.target.files[0] || null)}
                        style={{ display: 'none' }}
                      />
                      {replyImage && (
                        <span className="ms-2 text-muted small">
                          <i className="bi bi-check-circle text-success"></i> {replyImage.name}
                        </span>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleReply(discussion.id)}
                      >
                        <i className="bi bi-send"></i> Gửi trả lời
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText('')
                          setReplyImage(null)
                          const fileInput = document.getElementById(`reply-image-input-${discussion.id}`)
                          if (fileInput) fileInput.value = ''
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Hiển thị replies */}
                {discussion.replies && discussion.replies.length > 0 && (
                  <div className="ms-4 mt-3 border-start border-2 ps-3">
                    {discussion.replies.map((reply) => {
                      const isReplyTeacher = reply.user_role === 'teacher' || reply.user_id === teacher?.id
                      const replyDisplayName = reply.user_name || 'Học viên'
                      
                      return (
                        <div key={reply.id} className="mb-3 pb-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong 
                                className={isReplyTeacher ? 'text-danger' : ''}
                                style={isReplyTeacher ? { color: '#dc3545' } : {}}
                              >
                                <i className="bi bi-arrow-return-right me-1"></i>
                                {replyDisplayName}
                                {isReplyTeacher && (
                                  <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-person-badge"></i> Giảng viên
                                  </span>
                                )}
                              </strong>
                              <small className="text-muted ms-2">
                                {new Date(reply.created_at).toLocaleString('vi-VN')}
                              </small>
                            </div>
                            {user && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                              >
                                <i className="bi bi-reply"></i> Trả lời
                              </button>
                            )}
                          </div>
                          {reply.noi_dung && <p className="mb-0">{reply.noi_dung}</p>}
                          {reply.hinh_anh && (
                            <div className="mt-2">
                              <img 
                                src={reply.hinh_anh} 
                                alt="Hình ảnh đính kèm" 
                                className="img-fluid rounded"
                                style={{ maxWidth: '500px', maxHeight: '400px', objectFit: 'contain' }}
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Form reply cho reply */}
                          {replyingTo === reply.id && user && (
                            <div className="mt-2 p-2 bg-light rounded">
                              <div className="mb-2">
                                <textarea
                                  className="form-control"
                                  rows="2"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Nhập câu trả lời của bạn..."
                                ></textarea>
                              </div>
                              <div className="mb-2">
                                <label htmlFor={`reply-image-input-reply-${reply.id}`} className="btn btn-sm btn-outline-secondary mb-0" style={{ cursor: 'pointer' }}>
                                  <i className="bi bi-image"></i> Chọn hình ảnh
                                </label>
                                <input
                                  id={`reply-image-input-reply-${reply.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setReplyImage(e.target.files[0] || null)}
                                  style={{ display: 'none' }}
                                />
                                {replyImage && (
                                  <span className="ms-2 text-muted small">
                                    <i className="bi bi-check-circle text-success"></i> {replyImage.name}
                                  </span>
                                )}
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleReply(reply.id)}
                                >
                                  <i className="bi bi-send"></i> Gửi trả lời
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => {
                                    setReplyingTo(null)
                                    setReplyText('')
                                    setReplyImage(null)
                                    const fileInput = document.getElementById(`reply-image-input-reply-${reply.id}`)
                                    if (fileInput) fileInput.value = ''
                                  }}
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Assignments Section Component
function AssignmentsSection({ courseId, isTeacher }) {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submissionFile, setSubmissionFile] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    tieu_de: '',
    noi_dung: '',
    han_nop: '',
    is_required: false,
    diem_toi_da: 10
  })
  const [assignmentFile, setAssignmentFile] = useState(null)

  useEffect(() => {
    fetchAssignments()
  }, [courseId])

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/assignments`)
      setAssignments(response.data)
      
      // Fetch submissions for each assignment
      for (const assignment of response.data) {
        try {
          const subResponse = await axios.get(`/api/assignments/${assignment.id}/submissions`)
          if (subResponse.data.length > 0) {
            setSubmissions(prev => ({
              ...prev,
              [assignment.id]: subResponse.data[0]
            }))
          }
        } catch (error) {
          console.error(`Failed to fetch submissions for assignment ${assignment.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (assignmentId) => {
    try {
      const formData = new FormData()
      formData.append('noi_dung', submissionText)
      if (submissionFile) {
        formData.append('file', submissionFile)
      }

      await axios.post(`/api/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      alert('Nộp bài thành công!')
      setSubmissionText('')
      setSubmissionFile(null)
      setSelectedAssignment(null)
      fetchAssignments()
    } catch (error) {
      alert('Nộp bài thất bại: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      // Format datetime đúng cho backend
      let hanNopValue = null
      if (assignmentForm.han_nop) {
        // Nếu đã có format datetime, giữ nguyên; nếu chỉ có date, thêm time
        if (assignmentForm.han_nop.includes('T')) {
          hanNopValue = assignmentForm.han_nop
        } else {
          hanNopValue = `${assignmentForm.han_nop}T23:59:00`
        }
      }
      
      // Tạo FormData để gửi file
      const formData = new FormData()
      formData.append('tieu_de', assignmentForm.tieu_de.trim())
      formData.append('noi_dung', assignmentForm.noi_dung.trim())
      if (hanNopValue) {
        formData.append('han_nop', hanNopValue)
      }
      formData.append('is_required', assignmentForm.is_required || false)
      formData.append('diem_toi_da', parseFloat(assignmentForm.diem_toi_da) || 10)
      
      if (assignmentFile) {
        formData.append('file', assignmentFile)
      }
      
      await axios.post(`/api/courses/${courseId}/assignments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      alert('Tạo bài tập thành công! Tất cả học viên sẽ nhận được thông báo.')
      setAssignmentForm({
        tieu_de: '',
        noi_dung: '',
        han_nop: '',
        is_required: false,
        diem_toi_da: 10
      })
      setAssignmentFile(null)
      setShowCreateForm(false)
      fetchAssignments()
    } catch (error) {
      // Parse error message đúng cách
      let errorMsg = 'Tạo bài tập thất bại'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data
        } else if (error.response.data.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMsg = error.response.data.detail
          } else if (Array.isArray(error.response.data.detail)) {
            errorMsg = error.response.data.detail.map(e => e.msg || JSON.stringify(e)).join(', ')
          } else {
            errorMsg = JSON.stringify(error.response.data.detail)
          }
        } else {
          errorMsg = JSON.stringify(error.response.data)
        }
      } else if (error.message) {
        errorMsg = error.message
      }
      alert(`Tạo bài tập thất bại: ${errorMsg}`)
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có hạn'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>
  }

  const isTeacherRole = isTeacher || user?.role === 'teacher' || user?.vai_tro === 'teacher'

  return (
    <div>
      {/* Nút tạo bài tập cho giáo viên */}
      {isTeacherRole && (
        <div className="mb-4">
          {!showCreateForm ? (
            <button
              className="btn btn-primary-custom"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="bi bi-plus-circle"></i> Tạo bài tập mới
            </button>
          ) : (
            <div className="card-soft border-primary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <i className="bi bi-file-earmark-plus"></i> Tạo bài tập mới
                </h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setShowCreateForm(false)
                    setAssignmentForm({
                      tieu_de: '',
                      noi_dung: '',
                      han_nop: '',
                      is_required: false,
                      diem_toi_da: 10
                    })
                    setAssignmentFile(null)
                  }}
                >
                  <i className="bi bi-x"></i> Hủy
                </button>
              </div>
              <form onSubmit={handleCreateAssignment}>
                <div className="mb-3">
                  <label className="form-label">Tiêu đề bài tập <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={assignmentForm.tieu_de}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, tieu_de: e.target.value })}
                    required
                    placeholder="Ví dụ: Bài tập số 1 - Làm quen với Python"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nội dung bài tập <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={assignmentForm.noi_dung}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, noi_dung: e.target.value })}
                    required
                    placeholder="Mô tả chi tiết yêu cầu bài tập..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-paperclip me-1"></i>
                    File đính kèm <small className="text-muted">(tùy chọn)</small>
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setAssignmentFile(e.target.files[0] || null)}
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                  />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Hỗ trợ: PDF, Word, Text, ZIP, RAR (tối đa 10MB)
                  </small>
                  {assignmentFile && (
                    <div className="mt-2">
                      <span className="badge bg-info">
                        <i className="bi bi-file-earmark me-1"></i>
                        {assignmentFile.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={() => setAssignmentFile(null)}
                      >
                        <i className="bi bi-x"></i> Xóa
                      </button>
                    </div>
                  )}
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Hạn nộp <small className="text-muted">(tùy chọn)</small>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={assignmentForm.han_nop ? (assignmentForm.han_nop.includes('T') ? assignmentForm.han_nop.split('T')[0] : assignmentForm.han_nop) : ''}
                      onChange={(e) => {
                        const dateValue = e.target.value
                        // Lưu chỉ date, sẽ format khi submit
                        setAssignmentForm({ ...assignmentForm, han_nop: dateValue || '' })
                      }}
                    />
                    <small className="text-muted">Chọn ngày hạn nộp (mặc định là 23:59)</small>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Điểm tối đa</label>
                    <input
                      type="number"
                      className="form-control"
                      value={assignmentForm.diem_toi_da}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, diem_toi_da: parseFloat(e.target.value) || 10 })}
                      min="1"
                      step="0.5"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Loại bài tập</label>
                    <div className="form-check mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={assignmentForm.is_required}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, is_required: e.target.checked })}
                        id="isRequired"
                      />
                      <label className="form-check-label" htmlFor="isRequired">
                        Bắt buộc
                      </label>
                    </div>
                  </div>
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle"></i> Tất cả học viên đã đăng ký khóa học sẽ nhận được thông báo khi bạn tạo bài tập mới.
                </div>
                <button
                  type="submit"
                  className="btn btn-primary-custom"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i> Tạo bài tập
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {assignments.length === 0 && !showCreateForm ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle"></i> Chưa có bài tập nào.
          {isTeacherRole && (
            <div className="mt-2">
              <button
                className="btn btn-sm btn-primary-custom"
                onClick={() => setShowCreateForm(true)}
              >
                <i className="bi bi-plus-circle"></i> Tạo bài tập đầu tiên
              </button>
            </div>
          )}
        </div>
      ) : (
        assignments.map((assignment) => {
        const submission = submissions[assignment.id]
        const isOverdue = assignment.han_nop && new Date(assignment.han_nop) < new Date()
        const isSubmitted = submission && submission.trang_thai !== 'cancelled'

        return (
          <div key={assignment.id} className="card border mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-1">{assignment.tieu_de}</h5>
                  {assignment.is_required && (
                    <span className="badge bg-danger">Bắt buộc</span>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-muted">{assignment.noi_dung}</p>
              </div>

              {assignment.file_path && (
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-paperclip me-1"></i>
                    File đính kèm:
                  </label>
                  <div>
                    <a 
                      href={assignment.file_path.startsWith('http') ? assignment.file_path : `http://127.0.0.1:8001${assignment.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-download me-1"></i>
                      Tải file đính kèm
                    </a>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted d-block">
                  <i className="bi bi-calendar"></i> Hạn nộp: {formatDate(assignment.han_nop)}
                </small>
                <small className="text-muted d-block">
                  <i className="bi bi-star"></i> Điểm tối đa: {assignment.diem_toi_da}
                </small>
              </div>

              {/* Teacher actions */}
              {(user?.role === 'teacher' || user?.vai_tro === 'teacher') && (
                <div className="mb-3">
                  <Link
                    to={`/grade/${courseId}/${assignment.id}`}
                    className="btn btn-success"
                  >
                    <i className="bi bi-file-check"></i> Chấm bài ({submission ? 'Đã có bài nộp' : 'Chưa có bài nộp'})
                  </Link>
                </div>
              )}

              {isSubmitted ? (
                <div className="alert alert-success">
                  <h6>Đã nộp bài</h6>
                  {submission.diem !== null && (
                    <p className="mb-1">
                      <strong>Điểm: {submission.diem}/{assignment.diem_toi_da}</strong>
                    </p>
                  )}
                  {submission.nhan_xet && (
                    <p className="mb-0">
                      <strong>Nhận xét:</strong> {submission.nhan_xet}
                    </p>
                  )}
                  {submission.file_path && (
                    <a href={submission.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary mt-2">
                      <i className="bi bi-download"></i> Tải file đã nộp
                    </a>
                  )}
                </div>
              ) : (
                <>
                  {isOverdue && (
                    <div className="alert alert-warning mb-3">
                      <i className="bi bi-exclamation-triangle"></i> Đã quá hạn nộp bài
                    </div>
                  )}
                  {user && (user.role === 'student' || user.vai_tro === 'student') && (
                    <button
                      className="btn btn-primary-custom"
                      onClick={() => setSelectedAssignment(assignment)}
                    >
                      <i className="bi bi-upload"></i> Nộp bài
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )
        })
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nộp bài: {selectedAssignment.tieu_de}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedAssignment(null)
                    setSubmissionText('')
                    setSubmissionFile(null)
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nội dung bài làm:</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Nhập nội dung bài làm của bạn..."
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">File đính kèm (nếu có):</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setSubmissionFile(e.target.files[0])}
                  />
                </div>
                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle"></i> Hạn nộp: {formatDate(selectedAssignment.han_nop)}
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedAssignment(null)
                    setSubmissionText('')
                    setSubmissionFile(null)
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary-custom"
                  onClick={() => handleSubmit(selectedAssignment.id)}
                  disabled={!submissionText && !submissionFile}
                >
                  <i className="bi bi-upload"></i> Nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LearnPage() {
  const { id: courseId } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState(null)
  const [completedLessons, setCompletedLessons] = useState(new Set())
  const [videoWatchProgress, setVideoWatchProgress] = useState({}) // {lessonId: watchedPercentage}
  const [teacher, setTeacher] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra query param để mở tab tương ứng
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab === 'assignments') {
      setActiveSection('assignments')
    } else if (tab === 'quiz') {
      setActiveSection('quiz')
    } else if (tab === 'discussion') {
      setActiveSection('discussion')
    } else if (tab === 'playground') {
      setActiveSection('playground')
    }
    
    fetchData()
  }, [courseId])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchCourse(),
        fetchLessons(),
        fetchProgress(),
        fetchTeacher()
      ])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshLesson = async (lessonId) => {
    try {
      const response = await axios.get(`/api/lessons/${lessonId}`)
      setLessons(lessons.map(l => l.id === lessonId ? response.data : l))
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(response.data)
      }
    } catch (error) {
      console.error('Failed to refresh lesson:', error)
    }
  }

  // Tính toán isTeacher sau khi course và user đã được load
  const isTeacher = useMemo(() => {
    if (!user || !course) return false
    const userRole = user.role || user.vai_tro
    const isTeacherRole = userRole === 'teacher'
    const isCourseOwner = course.teacher_id === user.id
    return isTeacherRole && isCourseOwner
  }, [user, course])

  const fetchCourse = async () => {
    const response = await axios.get(`/api/courses/${courseId}`)
    setCourse(response.data)
  }

  const fetchLessons = async () => {
    const response = await axios.get(`/api/courses/${courseId}/lessons`)
    const sortedLessons = response.data.sort((a, b) => a.thu_tu - b.thu_tu)
    setLessons(sortedLessons)
    if (sortedLessons.length > 0 && !selectedLesson) {
      setSelectedLesson(sortedLessons[0])
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/progress`)
      setProgress(response.data)
      
      // Fetch tất cả progress của user để biết bài nào đã completed
      const allProgressResponse = await axios.get('/api/users/me/progress')
      const completedSet = new Set()
      allProgressResponse.data.forEach(p => {
        if (p.course_id === parseInt(courseId) && p.completed && p.lesson_id) {
          completedSet.add(p.lesson_id)
        }
      })
      setCompletedLessons(completedSet)
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const fetchTeacher = async () => {
    if (course?.teacher_id) {
      try {
        const response = await axios.get(`/api/users/${course.teacher_id}`)
        setTeacher(response.data)
      } catch (error) {
        console.error('Failed to fetch teacher:', error)
      }
    }
  }

  const markLessonComplete = async (lessonId, completed = true) => {
    try {
      await axios.post(`/api/courses/${courseId}/progress`, {
        lesson_id: lessonId,
        completed: completed
      })
      await fetchProgress()
      
      // Update local state
      const newSet = new Set(completedLessons)
      if (completed) {
        newSet.add(lessonId)
      } else {
        newSet.delete(lessonId)
      }
      setCompletedLessons(newSet)
    } catch (error) {
      console.error('Failed to mark lesson complete:', error)
    }
  }

  const handleVideoTimeUpdate = (lessonId, currentTime, duration) => {
    if (!duration || duration === 0) return
    
    const watchedPercentage = (currentTime / duration) * 100
    setVideoWatchProgress(prev => ({
      ...prev,
      [lessonId]: watchedPercentage
    }))
    
    // Tự động đánh dấu completed nếu xem >80% video
    if (watchedPercentage >= 80 && !completedLessons.has(lessonId)) {
      markLessonComplete(lessonId, true)
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

  const progressPercentage = progress?.progress_percentage || 0

  return (
    <div className="container-fluid my-4">
      {/* Header với tiến độ */}
      <div className="card-soft mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h1 className="title-gradient mb-2">{course.tieu_de}</h1>
            <p className="text-muted mb-3">{course.mo_ta || 'Không có mô tả'}</p>
            <div className="d-flex gap-2 flex-wrap">
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
          </div>
          <div className="col-md-4 text-end">
            <div className="card border-0 bg-light p-3">
              <h6 className="text-muted mb-2">Tiến độ học tập</h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="h4 mb-0 text-brand-green">{Math.round(progressPercentage)}%</span>
                {progressPercentage === 100 && (
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle"></i> Hoàn thành
                  </span>
                )}
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div
                  className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar Navigation */}
        <div className="col-lg-3 mb-4">
          <div className="card-soft sticky-top" style={{ top: '20px' }}>
            {/* Thông tin giáo viên */}
            {teacher && (
              <div className="mb-4 pb-3 border-bottom">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-person-badge text-brand-sky"></i> Giáo viên
                </h6>
                <div className="d-flex align-items-center">
                  <div
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <span className="text-white fw-bold">{teacher.ho_ten?.[0] || 'T'}</span>
                  </div>
                  <div>
                    <strong className="d-block">{teacher.ho_ten}</strong>
                    <small className="text-muted">
                      <i className="bi bi-envelope"></i> {teacher.email}
                    </small>
                  </div>
                </div>
                {teacher.so_dien_thoai && (
                  <small className="text-muted d-block mt-2">
                    <i className="bi bi-telephone"></i> {teacher.so_dien_thoai}
                  </small>
                )}
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="nav flex-column">
              <button
                className={`nav-link text-start ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveSection('overview')}
              >
                <i className="bi bi-house-door"></i> Tổng quan
              </button>
              <button
                className={`nav-link text-start ${activeSection === 'curriculum' ? 'active' : ''}`}
                onClick={() => setActiveSection('curriculum')}
              >
                <i className="bi bi-book"></i> Chương trình học
              </button>
              <button
                className={`nav-link text-start ${activeSection === 'assignments' ? 'active' : ''}`}
                onClick={() => setActiveSection('assignments')}
              >
                <i className="bi bi-file-earmark-check"></i> Bài tập
              </button>
              <button
                className={`nav-link text-start ${activeSection === 'quiz' ? 'active' : ''}`}
                onClick={() => setActiveSection('quiz')}
              >
                <i className="bi bi-question-circle"></i> Quiz
              </button>
              <button
                className={`nav-link text-start ${activeSection === 'discussion' ? 'active' : ''}`}
                onClick={() => setActiveSection('discussion')}
              >
                <i className="bi bi-chat-left-text"></i> Thảo luận
              </button>
              <button
                className={`nav-link text-start ${activeSection === 'playground' ? 'active' : ''}`}
                onClick={() => setActiveSection('playground')}
              >
                <i className="bi bi-code-square"></i> Coding Playground
              </button>
            </nav>

            {/* Lesson Tree */}
            <div className="mt-4 pt-3 border-top">
              <h6 className="text-muted mb-3">Chương trình học</h6>
              <div className="list-group list-group-flush">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={`list-group-item list-group-item-action ${
                      selectedLesson?.id === lesson.id ? 'active' : ''
                    } ${!lesson.is_unlocked ? 'opacity-50' : ''}`}
                    onClick={async () => {
                      if (lesson.is_unlocked) {
                        // Fetch lại dữ liệu bài học để đảm bảo có tài liệu mới nhất
                        try {
                          const response = await axios.get(`/api/lessons/${lesson.id}`)
                          setSelectedLesson(response.data)
                        } catch (error) {
                          console.error('Failed to fetch lesson:', error)
                          setSelectedLesson(lesson)
                        }
                        setActiveSection('curriculum')
                      }
                    }}
                    disabled={!lesson.is_unlocked}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-play-circle me-2"></i>
                        Bài {lesson.thu_tu}: {lesson.tieu_de_muc}
                        {completedLessons.has(lesson.id) && (
                          <i className="bi bi-check-circle-fill text-success ms-2" title="Đã hoàn thành"></i>
                        )}
                      </span>
                      <div>
                        {!lesson.is_unlocked && <i className="bi bi-lock"></i>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          {/* Section: Tổng quan */}
          {activeSection === 'overview' && (
            <div className="card-soft mb-4">
              <h3 className="title-gradient mb-4">
                <i className="bi bi-house-door"></i> Tổng quan khóa học
              </h3>
              <div className="row">
                <div className="col-md-4 mb-4">
                  <div className="card border h-100">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-graph-up text-success"></i> Tiến độ học tập
                      </h5>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Hoàn thành</span>
                          <span><strong>{Math.round(progressPercentage)}%</strong></span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${progressPercentage}%` }}
                          >
                            {Math.round(progressPercentage)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card border h-100">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-info-circle text-primary"></i> Thông tin khóa học
                      </h5>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                          <i className="bi bi-calendar3 text-muted"></i>
                          <strong> Số buổi:</strong> {course.so_buoi || 'N/A'}
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-clock text-muted"></i>
                          <strong> Thời lượng:</strong> {course.thoi_luong || 'N/A'}
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-laptop text-muted"></i>
                          <strong> Hình thức:</strong> {course.hinh_thuc || 'online'}
                        </li>
                        <li className="mb-0">
                          <i className="bi bi-star text-muted"></i>
                          <strong> Cấp độ:</strong> {course.cap_do || 'N/A'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {teacher && (
                  <div className="col-md-4 mb-4">
                    <div className="card border-primary h-100">
                      <div className="card-body">
                        <h5 className="card-title text-primary">
                          <i className="bi bi-person-badge"></i> Liên hệ giảng viên
                        </h5>
                        <div className="text-center mb-3">
                          <div
                            className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                            style={{ width: '60px', height: '60px' }}
                          >
                            <span className="text-white fw-bold fs-4">{teacher.ho_ten?.[0] || 'T'}</span>
                          </div>
                          <h6 className="mb-1">{teacher.ho_ten}</h6>
                        </div>
                        <div className="list-group list-group-flush">
                          <div className="list-group-item px-0 border-0">
                            <i className="bi bi-envelope text-primary me-2"></i>
                            <a href={`mailto:${teacher.email}`} className="text-decoration-none">
                              {teacher.email}
                            </a>
                          </div>
                          {teacher.so_dien_thoai && (
                            <div className="list-group-item px-0 border-0">
                              <i className="bi bi-telephone text-primary me-2"></i>
                              <a href={`tel:${teacher.so_dien_thoai}`} className="text-decoration-none">
                                {teacher.so_dien_thoai}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <button
                            className="btn btn-primary w-100"
                            onClick={() => setActiveSection('discussion')}
                          >
                            <i className="bi bi-chat-dots"></i> Nhắn tin cho giáo viên
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Chương trình học */}
          {activeSection === 'curriculum' && (
            <div className="card-soft mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="title-gradient mb-0">
                  <i className="bi bi-book"></i> Chương trình học / Bài giảng
                </h3>
                <span className="badge bg-primary">Tổng: {lessons.length} bài học</span>
              </div>

              {lessons.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle"></i> Chưa có nội dung khóa học.
                </div>
              ) : (
                <div className="timeline">
                  {lessons.map((lesson) => {
                    const videoUrl = getVideoEmbedUrl(lesson.video_path)
                    const isSelected = selectedLesson?.id === lesson.id

                    return (
                      <div key={lesson.id} className="timeline-item mb-4">
                        <div className={`card border-0 shadow-sm ${isSelected ? 'border-primary' : ''}`}>
                          <div className="card-body">
                            <div className="d-flex align-items-start">
                              <div className="timeline-marker me-3">
                                <div className="timeline-number">{lesson.thu_tu}</div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h5 className="mb-0">
                                    <i className="bi bi-play-circle-fill text-brand-green me-2"></i>
                                    {lesson.tieu_de_muc}
                                  </h5>
                                  <span className="badge bg-light text-dark">Bài {lesson.thu_tu}</span>
                                </div>

                                {lesson.noi_dung && (
                                  <div className="lesson-content mb-3">
                                    <p className="text-muted mb-2">{lesson.noi_dung}</p>
                                  </div>
                                )}

                                {isSelected && videoUrl && (
                                  <div className="mb-3">
                                    <VideoPlayer 
                                      videoUrl={videoUrl}
                                      videoPath={lesson.video_path}
                                      duration={lesson.video_duration}
                                      lazy={true}  // Lazy load video để tối ưu performance
                                      onTimeUpdate={(time, duration) => {
                                        handleVideoTimeUpdate(lesson.id, time, duration)
                                      }}
                                    />
                                    <div className="mt-3 d-flex justify-content-between align-items-center">
                                      <div>
                                        {lesson.video_duration && (
                                          <small className="text-muted d-block">
                                            <i className="bi bi-clock"></i> Thời lượng:{' '}
                                            {Math.floor(lesson.video_duration / 60)}:
                                            {String(lesson.video_duration % 60).padStart(2, '0')}
                                          </small>
                                        )}
                                        {videoWatchProgress[lesson.id] && (
                                          <small className="text-info d-block mt-1">
                                            <i className="bi bi-eye"></i> Đã xem: {Math.round(videoWatchProgress[lesson.id])}%
                                          </small>
                                        )}
                                      </div>
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={`completed-${lesson.id}`}
                                          checked={completedLessons.has(lesson.id)}
                                          onChange={(e) => {
                                            markLessonComplete(lesson.id, e.target.checked)
                                          }}
                                        />
                                        <label className="form-check-label" htmlFor={`completed-${lesson.id}`}>
                                          <i className="bi bi-check-circle me-1"></i>
                                          Đã hoàn thành bài học
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Tài liệu và Resources - Luôn hiển thị khi bài học được chọn */}
                                {isSelected && (
                                  <div className="mt-4 p-3 bg-light rounded">
                                    <h5 className="mb-3">
                                      <i className="bi bi-file-earmark-text"></i> Tài liệu học tập
                                    </h5>
                                    
                                    {/* PDF */}
                                    {lesson.tai_lieu_pdf ? (
                                      <div className="mb-3">
                                        <a 
                                          href={lesson.tai_lieu_pdf.startsWith('http') ? lesson.tai_lieu_pdf : `http://localhost:8001${lesson.tai_lieu_pdf}`}
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="btn btn-outline-primary btn-sm"
                                        >
                                          <i className="bi bi-file-pdf"></i> Tải tài liệu PDF
                                        </a>
                                      </div>
                                    ) : null}

                                    {/* Links */}
                                    {lesson.tai_lieu_links && lesson.tai_lieu_links.length > 0 ? (
                                      <div className="mb-3">
                                        <h6 className="text-muted mb-2">Liên kết hữu ích:</h6>
                                        <ul className="list-unstyled">
                                          {lesson.tai_lieu_links.map((link, idx) => (
                                            <li key={idx} className="mb-2">
                                              <a 
                                                href={link.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-decoration-none"
                                              >
                                                <i className="bi bi-link-45deg"></i> {String(link.title || link.url)}
                                              </a>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ) : null}

                                    {/* Resources */}
                                    {lesson.resources && lesson.resources.length > 0 ? (
                                      <div>
                                        <h6 className="text-muted mb-2">Tài nguyên khác:</h6>
                                        <div className="row">
                                          {lesson.resources.map((resource, idx) => (
                                            <div key={idx} className="col-md-6 mb-2">
                                              <div className="card border">
                                                <div className="card-body p-2">
                                                  <div className="d-flex align-items-start">
                                                    {resource.type === 'pdf' && (
                                                      <i className="bi bi-file-pdf text-danger fs-5 me-2"></i>
                                                    )}
                                                    {resource.type === 'link' && (
                                                      <i className="bi bi-link-45deg text-primary fs-5 me-2"></i>
                                                    )}
                                                    {resource.type === 'code' && (
                                                      <i className="bi bi-code-square text-success fs-5 me-2"></i>
                                                    )}
                                                    <div className="flex-grow-1">
                                                      <h6 className="mb-1 small">
                                                        {String(resource.title || 'Tài nguyên')}
                                                      </h6>
                                                      {resource.description && (
                                                        <p className="mb-1 small text-muted">
                                                          {String(resource.description)}
                                                        </p>
                                                      )}
                                                      {resource.url && (
                                                        <a 
                                                          href={resource.url} 
                                                          target="_blank" 
                                                          rel="noopener noreferrer"
                                                          className="btn btn-sm btn-outline-primary"
                                                        >
                                                          Mở <i className="bi bi-box-arrow-up-right"></i>
                                                        </a>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null}

                                    {/* Thông báo nếu chưa có tài liệu */}
                                    {!lesson.tai_lieu_pdf && (!lesson.tai_lieu_links || lesson.tai_lieu_links.length === 0) && (!lesson.resources || lesson.resources.length === 0) && (
                                      <div className="alert alert-info mb-0">
                                        <i className="bi bi-info-circle"></i> Chưa có tài liệu cho bài học này.
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Editor tài liệu cho giáo viên */}
                                {isSelected && isTeacher && (
                                  <LessonResourcesEditor
                                    lesson={lesson}
                                    onUpdate={() => refreshLesson(lesson.id)}
                                  />
                                )}

                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={async () => {
                                      // Refresh lesson data để đảm bảo có tài liệu mới nhất
                                      try {
                                        const response = await axios.get(`/api/lessons/${lesson.id}`)
                                        setSelectedLesson(response.data)
                                      } catch (error) {
                                        console.error('Failed to refresh lesson:', error)
                                      }
                                      markLessonComplete(lesson.id)
                                    }}
                                  >
                                    <i className="bi bi-check-circle"></i> Đánh dấu đã học
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={async () => {
                                      // Refresh lesson data để đảm bảo có tài liệu mới nhất
                                      try {
                                        const response = await axios.get(`/api/lessons/${lesson.id}`)
                                        setSelectedLesson(response.data)
                                      } catch (error) {
                                        console.error('Failed to refresh lesson:', error)
                                      }
                                      setActiveSection('discussion')
                                    }}
                                  >
                                    <i className="bi bi-chat-dots"></i> Hỏi về bài này
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section: Bài tập */}
          {activeSection === 'assignments' && (
            <div className="card-soft mb-4">
              <h3 className="title-gradient mb-4">
                <i className="bi bi-file-earmark-check"></i> Bài tập
              </h3>
              <AssignmentsSection courseId={courseId} isTeacher={isTeacher} />
            </div>
          )}

          {/* Section: Quiz */}
          {activeSection === 'quiz' && selectedLesson && (
            <>
              {user && (user.role === 'teacher' || user.vai_tro === 'teacher') && (
                <QuizCreator
                  lessonId={selectedLesson.id}
                  onSuccess={() => {
                    // Refresh quiz list
                    window.location.reload()
                  }}
                />
              )}
              <QuizSection lessonId={selectedLesson.id} />
            </>
          )}
          {activeSection === 'quiz' && !selectedLesson && (
            <div className="card-soft mb-4">
              <div className="alert alert-info">
                <i className="bi bi-info-circle"></i> Vui lòng chọn bài học để xem quiz.
              </div>
            </div>
          )}

          {/* Section: Coding Playground */}
          {activeSection === 'playground' && (
            <div>
              <CodingPlayground lessonId={selectedLesson?.id} courseId={courseId} />
            </div>
          )}

          {/* Section: Thảo luận */}
          {activeSection === 'discussion' && (
            <DiscussionSection courseId={courseId} teacher={teacher} />
          )}
        </div>
      </div>
    </div>
  )
}

