import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function QuizSection({ lessonId }) {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (lessonId) {
      fetchQuizzes()
    }
  }, [lessonId])

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`/api/lessons/${lessonId}/quizzes`)
      setQuizzes(response.data)
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setAnswers({})
    setResult(null)
  }

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    })
  }

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return

    // Kiểm tra đã trả lời đủ câu hỏi chưa
    const unanswered = selectedQuiz.questions.filter(
      q => !answers[q.id]
    )
    if (unanswered.length > 0) {
      alert(`Bạn chưa trả lời ${unanswered.length} câu hỏi. Vui lòng hoàn thành tất cả câu hỏi!`)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        quiz_id: selectedQuiz.id,
        answers: selectedQuiz.questions.map(q => ({
          question_id: q.id,
          option_id: answers[q.id]
        }))
      }

      const response = await axios.post(`/api/quizzes/${selectedQuiz.id}/attempt`, payload)
      setResult(response.data)
      fetchQuizzes() // Refresh để có thể làm lại
    } catch (error) {
      alert('Nộp bài thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="card-soft mb-4">
        <h3 className="title-gradient mb-4">
          <i className="bi bi-question-circle"></i> Quiz
        </h3>
        <div className="text-center py-4">Đang tải...</div>
      </div>
    )
  }

  if (!selectedQuiz) {
    return (
      <div className="card-soft mb-4">
        <h3 className="title-gradient mb-4">
          <i className="bi bi-question-circle"></i> Quiz
        </h3>
        {quizzes.length === 0 ? (
          <div className="alert alert-info">
            <i className="bi bi-info-circle"></i> Chưa có quiz nào cho bài học này.
          </div>
        ) : (
          <div className="list-group">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{quiz.tieu_de}</h5>
                    {quiz.mo_ta && <p className="text-muted mb-0 small">{quiz.mo_ta}</p>}
                    <div className="mt-2">
                      <span className="badge bg-info me-2">
                        {quiz.questions.length} câu hỏi
                      </span>
                      <span className="badge bg-success">
                        Điểm tối đa: {quiz.diem_toi_da}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary-custom"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    <i className="bi bi-play-circle"></i> Làm bài
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card-soft mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="title-gradient mb-0">
          <i className="bi bi-question-circle"></i> {selectedQuiz.tieu_de}
        </h3>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => {
            setSelectedQuiz(null)
            setAnswers({})
            setResult(null)
          }}
        >
          <i className="bi bi-arrow-left"></i> Quay lại
        </button>
      </div>

      {result ? (
        <div className="alert alert-success">
          <h5>
            <i className="bi bi-check-circle"></i> Hoàn thành!
          </h5>
          <p className="mb-0">
            Điểm của bạn: <strong>{result.diem}/{selectedQuiz.diem_toi_da}</strong>
          </p>
        </div>
      ) : (
        <>
          {selectedQuiz.mo_ta && (
            <div className="alert alert-info mb-4">
              {selectedQuiz.mo_ta}
            </div>
          )}

          <form>
            {selectedQuiz.questions.map((question, qIdx) => (
              <div key={question.id} className="mb-4 p-3 border rounded">
                <h5 className="mb-3">
                  Câu {qIdx + 1}: {question.cau_hoi}
                  <span className="badge bg-secondary ms-2">{question.diem} điểm</span>
                </h5>
                <div className="list-group">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className={`list-group-item list-group-item-action ${
                        answers[question.id] === option.id ? 'active' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() => handleAnswerChange(question.id, option.id)}
                        className="me-2"
                      />
                      {option.noi_dung}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSelectedQuiz(null)
                  setAnswers({})
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary-custom"
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang nộp...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i> Nộp bài
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

