import { useState } from 'react'
import axios from 'axios'

export default function LessonResourcesEditor({ lesson, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tai_lieu_links: lesson.tai_lieu_links || [],
    resources: lesson.resources || []
  })
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [newResource, setNewResource] = useState({ type: 'link', title: '', url: '', description: '' })
  const [videoLink, setVideoLink] = useState(lesson.video_path || '')

  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      setFormData({
        ...formData,
        tai_lieu_links: [...formData.tai_lieu_links, newLink]
      })
      setNewLink({ title: '', url: '' })
    }
  }

  const handleRemoveLink = (index) => {
    setFormData({
      ...formData,
      tai_lieu_links: formData.tai_lieu_links.filter((_, i) => i !== index)
    })
  }

  const handleAddResource = () => {
    if (newResource.title && newResource.url) {
      setFormData({
        ...formData,
        resources: [...formData.resources, newResource]
      })
      setNewResource({ type: 'link', title: '', url: '', description: '' })
    }
  }

  const handleRemoveResource = (index) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index)
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('tai_lieu_links', JSON.stringify(formData.tai_lieu_links))
      formDataToSend.append('resources', JSON.stringify(formData.resources))

      await axios.put(`/api/lessons/${lesson.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Cập nhật tài liệu thành công!')
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Chỉ chấp nhận file video!')
      return
    }

    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('video_file', file)

      await axios.put(`/api/lessons/${lesson.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Upload video thành công!')
      if (onUpdate) onUpdate()
    } catch (error) {
      alert('Upload thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVideoLink = async () => {
    if (!videoLink || videoLink === lesson.video_path) return

    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('video_path', videoLink)

      await axios.put(`/api/lessons/${lesson.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Cập nhật link video thành công!')
      if (onUpdate) onUpdate()
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUploadPDF = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Chỉ chấp nhận file PDF!')
      return
    }

    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('tai_lieu_pdf_file', file)

      await axios.put(`/api/lessons/${lesson.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Upload PDF thành công!')
      if (onUpdate) onUpdate()
    } catch (error) {
      alert('Upload thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="mt-3">
        <button
          className="btn btn-primary-custom"
          onClick={() => setIsEditing(true)}
        >
          <i className="bi bi-gear-fill me-2"></i> Quản lý tài liệu bài học
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4 card-soft shadow-sm">
      {/* Header */}
      <div className="card-header bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 title-gradient">
            <i className="bi bi-file-earmark-text me-2"></i> Quản lý tài liệu bài học
          </h5>
          <div>
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  tai_lieu_links: lesson.tai_lieu_links || [],
                  resources: lesson.resources || []
                })
                setVideoLink(lesson.video_path || '')
              }}
              disabled={loading}
            >
              <i className="bi bi-x-lg"></i> Hủy
            </button>
            <button
              className="btn btn-sm btn-primary-custom"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="card-body p-4">

        {/* Upload Video */}
        <div className="mb-4 p-3 bg-light rounded border">
          <label className="form-label fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-play-circle-fill text-primary me-2 fs-5"></i> Video bài học
          </label>
          <div className="mb-2">
            <small className="text-muted d-block mb-3">
              <i className="bi bi-info-circle me-1"></i> Upload video file hoặc nhập link YouTube/Vimeo
            </small>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label small text-muted">Upload video file</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleUploadVideo}
                  className="form-control"
                  disabled={loading}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted">Hoặc nhập link</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://youtube.com/... hoặc https://vimeo.com/..."
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    disabled={loading}
                    onBlur={handleSaveVideoLink}
                  />
                </div>
              </div>
            </div>
            {lesson.video_path && (
              <div className="mt-3 p-2 bg-white rounded border">
                <small className="text-success">
                  <i className="bi bi-check-circle me-1"></i> Video hiện tại: 
                  <span className="ms-1">
                    {lesson.video_path.includes('youtube.com') || lesson.video_path.includes('vimeo.com') 
                      ? lesson.video_path 
                      : 'Video đã upload'}
                  </span>
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Upload PDF */}
        <div className="mb-4 p-3 bg-light rounded border">
          <label className="form-label fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-file-pdf-fill text-danger me-2 fs-5"></i> Tài liệu PDF
          </label>
          <div className="d-flex gap-2 align-items-end">
            <div className="flex-grow-1">
              <input
                type="file"
                accept=".pdf"
                onChange={handleUploadPDF}
                className="form-control"
                disabled={loading}
              />
            </div>
            {lesson.tai_lieu_pdf && (
              <a
                href={
                  lesson.tai_lieu_pdf.startsWith('http')
                    ? lesson.tai_lieu_pdf
                    : `${import.meta.env.VITE_API_BASE_URL || ''}${lesson.tai_lieu_pdf}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary"
              >
                <i className="bi bi-eye me-1"></i> Xem PDF
              </a>
            )}
          </div>
        </div>

        {/* Quản lý Links */}
        <div className="mb-4 p-3 bg-light rounded border">
          <label className="form-label fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-link-45deg text-primary me-2 fs-5"></i> Liên kết hữu ích
          </label>
          
          {/* Danh sách links hiện có */}
          {formData.tai_lieu_links.length > 0 && (
            <div className="mb-3">
              {formData.tai_lieu_links.map((link, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-3 bg-white rounded border shadow-sm">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <i className="bi bi-link-45deg text-primary me-2"></i>
                      <strong>{link.title}</strong>
                    </div>
                    <small className="text-muted d-block ms-4">{link.url}</small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={() => handleRemoveLink(index)}
                    disabled={loading}
                    title="Xóa link"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form thêm link mới */}
          <div className="border-top pt-3">
            <label className="form-label small text-muted mb-2">Thêm liên kết mới</label>
            <div className="row g-2">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tiêu đề link"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="col-md-1">
                <button
                  className="btn btn-primary-custom w-100"
                  onClick={handleAddLink}
                  disabled={loading || !newLink.title || !newLink.url}
                  title="Thêm link"
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quản lý Resources */}
        <div className="p-3 bg-light rounded border">
          <label className="form-label fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-folder-fill text-info me-2 fs-5"></i> Tài nguyên khác
          </label>
          
          {/* Danh sách resources hiện có */}
          {formData.resources.length > 0 && (
            <div className="mb-3">
              {formData.resources.map((resource, index) => (
                <div key={index} className="d-flex justify-content-between align-items-start mb-2 p-3 bg-white rounded border shadow-sm">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      {resource.type === 'pdf' && <i className="bi bi-file-pdf-fill text-danger fs-5 me-2"></i>}
                      {resource.type === 'link' && <i className="bi bi-link-45deg text-primary fs-5 me-2"></i>}
                      {resource.type === 'code' && <i className="bi bi-code-square text-success fs-5 me-2"></i>}
                      <strong>{resource.title}</strong>
                    </div>
                    {resource.description && (
                      <p className="text-muted small mb-1 ms-4">{resource.description}</p>
                    )}
                    <small className="text-muted d-block ms-4">
                      <i className="bi bi-link-45deg me-1"></i>{resource.url}
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={() => handleRemoveResource(index)}
                    disabled={loading}
                    title="Xóa tài nguyên"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form thêm resource mới */}
          <div className="border-top pt-3">
            <label className="form-label small text-muted mb-2">Thêm tài nguyên mới</label>
            <div className="row g-2">
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  disabled={loading}
                >
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="code">Code</option>
                </select>
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tiêu đề"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="url"
                  className="form-control"
                  placeholder="URL"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Mô tả (tùy chọn)"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="col-md-1">
                <button
                  className="btn btn-primary-custom w-100"
                  onClick={handleAddResource}
                  disabled={loading || !newResource.title || !newResource.url}
                  title="Thêm tài nguyên"
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

