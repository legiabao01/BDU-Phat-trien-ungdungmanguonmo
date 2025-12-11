import { useState, useRef, useEffect } from 'react'

export default function VideoPlayer({ videoUrl, videoPath, onTimeUpdate }) {
  const videoRef = useRef(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false)
  const [subtitleTrack, setSubtitleTrack] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [onTimeUpdate])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

  // Nếu là YouTube hoặc Vimeo, dùng iframe
  if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com'))) {
    return (
      <div className="position-relative">
        <div className="ratio ratio-16x9">
          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
            <iframe
              src={videoUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded shadow-sm"
            ></iframe>
          ) : (
            <iframe
              src={videoUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="rounded shadow-sm"
            ></iframe>
          )}
        </div>
        <div className="mt-2 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="bi bi-info-circle"></i> Video từ YouTube/Vimeo - dùng controls của trình phát gốc
          </small>
        </div>
      </div>
    )
  }

  // Video HTML5 với custom controls
  return (
    <div 
      className="position-relative bg-black rounded shadow-sm"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-100 rounded"
        style={{ maxHeight: '600px', display: 'block' }}
        onClick={togglePlay}
      >
        <source src={videoUrl || videoPath} type="video/mp4" />
        {subtitleTrack && (
          <track
            kind="subtitles"
            src={subtitleTrack}
            srcLang="vi"
            label="Tiếng Việt"
            default
          />
        )}
        Trình duyệt của bạn không hỗ trợ video tag.
      </video>

      {/* Custom Controls */}
      {showControls && (
        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 p-3 rounded-bottom">
          {/* Progress Bar */}
          <div
            className="progress mb-2"
            style={{ height: '6px', cursor: 'pointer' }}
            onClick={handleSeek}
          >
            <div
              className="progress-bar bg-danger"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-link text-white p-0"
                onClick={togglePlay}
                style={{ fontSize: '1.5rem' }}
              >
                <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
              </button>

              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-sm btn-link text-white p-0"
                  onClick={() => setVolume(Math.max(0, volume - 0.1))}
                >
                  <i className="bi bi-volume-down"></i>
                </button>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ width: '80px' }}
                />
                <button
                  className="btn btn-sm btn-link text-white p-0"
                  onClick={() => setVolume(Math.min(1, volume + 0.1))}
                >
                  <i className="bi bi-volume-up"></i>
                </button>
              </div>

              <span className="text-white small">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              {/* Speed Control */}
              <div className="position-relative">
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                >
                  <i className="bi bi-speedometer2"></i> {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div className="position-absolute bottom-100 end-0 mb-2 bg-dark rounded p-2" style={{ minWidth: '100px', zIndex: 1000 }}>
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        className={`btn btn-sm w-100 mb-1 ${playbackRate === speed ? 'btn-primary' : 'btn-outline-light'}`}
                        onClick={() => {
                          setPlaybackRate(speed)
                          setShowSpeedMenu(false)
                        }}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtitle Control */}
              <div className="position-relative">
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                >
                  <i className="bi bi-subtitles"></i>
                </button>
                {showSubtitleMenu && (
                  <div className="position-absolute bottom-100 end-0 mb-2 bg-dark rounded p-2" style={{ minWidth: '150px', zIndex: 1000 }}>
                    <button
                      className={`btn btn-sm w-100 mb-1 ${!subtitleTrack ? 'btn-primary' : 'btn-outline-light'}`}
                      onClick={() => {
                        setSubtitleTrack(null)
                        setShowSubtitleMenu(false)
                      }}
                    >
                      Tắt phụ đề
                    </button>
                    <input
                      type="file"
                      accept=".vtt,.srt"
                      className="d-none"
                      id="subtitle-input"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          const url = URL.createObjectURL(file)
                          setSubtitleTrack(url)
                          setShowSubtitleMenu(false)
                        }
                      }}
                    />
                    <label htmlFor="subtitle-input" className="btn btn-sm btn-outline-light w-100 mb-0">
                      Tải file phụ đề (.vtt/.srt)
                    </label>
                  </div>
                )}
              </div>

              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.requestFullscreen()
                  }
                }}
              >
                <i className="bi bi-arrows-fullscreen"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

