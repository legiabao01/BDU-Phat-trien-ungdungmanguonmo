import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function QuizCreator({ lessonId, onSuccess }) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    tieu_de: '',
    mo_ta: '',
    thoi_gian_lam_bai: 0,
    diem_toi_da: 10,
    is_required: false,
    questions: []
  })

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          cau_hoi: '',
          loai: 'multiple_choice',
          diem: 1,
          thu_tu: formData.questions.length + 1,
          options: [
            { noi_dung: '', is_correct: false, thu_tu: 1 },
            { noi_dung: '', is_correct: false, thu_tu: 2 }
          ]
        }
      ]
    })
  }

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[index][field] = value
    setFormData({ ...formData, questions: newQuestions })
  }

  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions]
    newQuestions[questionIndex].options.push({
      noi_dung: '',
      is_correct: false,
      thu_tu: newQuestions[questionIndex].options.length + 1
    })
    setFormData({ ...formData, questions: newQuestions })
  }

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[questionIndex].options[optionIndex][field] = value
    setFormData({ ...formData, questions: newQuestions })
  }

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData({ ...formData, questions: newQuestions })
  }

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions]
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
        (_, i) => i !== optionIndex
      )
      setFormData({ ...formData, questions: newQuestions })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.tieu_de.trim()) {
      alert('Vui lòng nhập tiêu đề quiz')
      return
    }

    if (formData.questions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi')
      return
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i]
      if (!q.cau_hoi.trim()) {
        alert(`Câu hỏi ${i + 1} chưa có nội dung`)
        return
      }
      if (q.options.length < 2) {
        alert(`Câu hỏi ${i + 1} cần ít nhất 2 đáp án`)
        return
      }
      const hasCorrect = q.options.some(opt => opt.is_correct)
      if (!hasCorrect) {
        alert(`Câu hỏi ${i + 1} cần ít nhất 1 đáp án đúng`)
        return
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].noi_dung.trim()) {
          alert(`Câu hỏi ${i + 1}, đáp án ${j + 1} chưa có nội dung`)
          return
        }
      }
    }

    setSubmitting(true)
    try {
      await axios.post(`/api/lessons/${lessonId}/quizzes`, {
        lesson_id: lessonId,
        ...formData
      })
      alert('Tạo quiz thành công!')
      setFormData({
        tieu_de: '',
        mo_ta: '',
        thoi_gian_lam_bai: 0,
        diem_toi_da: 10,
        is_required: false,
        questions: []
      })
      setShowForm(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      alert('Tạo quiz thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <button
        className="btn btn-primary-custom mb-3"
        onClick={() => setShowForm(true)}
      >
        <i className="bi bi-plus-circle"></i> Tạo Quiz mới
      </button>
    )
  }

  return (
    <div className="card-soft mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="title-gradient mb-0">Tạo Quiz mới</h4>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => {
            setShowForm(false)
            setFormData({
              tieu_de: '',
              mo_ta: '',
              thoi_gian_lam_bai: 0,
              diem_toi_da: 10,
              is_required: false,
              questions: []
            })
          }}
        >
          <i className="bi bi-x"></i> Hủy
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tiêu đề Quiz *</label>
          <input
            type="text"
            className="form-control"
            value={formData.tieu_de}
            onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
            required
            placeholder="Ví dụ: Kiểm tra kiến thức bài 1"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-control"
            rows="2"
            value={formData.mo_ta}
            onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
            placeholder="Mô tả về quiz này..."
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Thời gian làm bài (phút)</label>
            <input
              type="number"
              className="form-control"
              value={formData.thoi_gian_lam_bai}
              onChange={(e) => setFormData({ ...formData, thoi_gian_lam_bai: parseInt(e.target.value) || 0 })}
              min="0"
              placeholder="0 = không giới hạn"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Điểm tối đa</label>
            <input
              type="number"
              className="form-control"
              value={formData.diem_toi_da}
              onChange={(e) => setFormData({ ...formData, diem_toi_da: parseFloat(e.target.value) || 10 })}
              min="1"
              step="0.5"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label d-block">Bắt buộc</label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Câu hỏi</h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addQuestion}
            >
              <i className="bi bi-plus-circle"></i> Thêm câu hỏi
            </button>
          </div>

          {formData.questions.map((question, qIdx) => (
            <div key={qIdx} className="card mb-3 border">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="mb-0">Câu hỏi {qIdx + 1}</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeQuestion(qIdx)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                <div className="mb-3">
                  <label className="form-label">Nội dung câu hỏi *</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={question.cau_hoi}
                    onChange={(e) => updateQuestion(qIdx, 'cau_hoi', e.target.value)}
                    placeholder="Nhập câu hỏi..."
                    required
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Điểm</label>
                    <input
                      type="number"
                      className="form-control"
                      value={question.diem}
                      onChange={(e) => updateQuestion(qIdx, 'diem', parseFloat(e.target.value) || 1)}
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">Đáp án</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => addOption(qIdx)}
                    >
                      <i className="bi bi-plus"></i> Thêm đáp án
                    </button>
                  </div>

                  {question.options.map((option, oIdx) => (
                    <div key={oIdx} className="input-group mb-2">
                      <div className="input-group-text">
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={option.is_correct}
                          onChange={() => {
                            // Chỉ cho phép 1 đáp án đúng
                            const newOptions = question.options.map((opt, idx) => ({
                              ...opt,
                              is_correct: idx === oIdx
                            }))
                            updateQuestion(qIdx, 'options', newOptions)
                          }}
                        />
                        <span className="ms-2">Đúng</span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={option.noi_dung}
                        onChange={(e) => updateOption(qIdx, oIdx, 'noi_dung', e.target.value)}
                        placeholder={`Đáp án ${oIdx + 1}`}
                        required
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeOption(qIdx, oIdx)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {formData.questions.length === 0 && (
            <div className="alert alert-info">
              <i className="bi bi-info-circle"></i> Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowForm(false)}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary-custom"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang tạo...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i> Tạo Quiz
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

