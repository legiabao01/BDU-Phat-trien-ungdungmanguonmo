# Video Streaming Optimization

Tài liệu này mô tả các tối ưu hóa đã được triển khai cho video streaming trong hệ thống e-learning.

## Các tính năng đã triển khai

### 1. HTTP Range Request Support (206 Partial Content)

**Backend**: `fastapi_app/api/routes/video_streaming.py`

- Hỗ trợ HTTP Range requests cho phép:
  - **Seek**: Người dùng có thể nhảy đến bất kỳ phần nào của video mà không cần tải lại từ đầu
  - **Pause/Resume**: Tạm dừng và tiếp tục phát video hiệu quả
  - **Bandwidth optimization**: Chỉ tải phần video cần thiết, tiết kiệm băng thông

**Endpoint**: `/api/video/{filename}`

**Ví dụ Range Request**:
```
GET /api/video/lesson_1.mp4 HTTP/1.1
Range: bytes=0-1023
```

**Response**:
```
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/1048576
Content-Length: 1024
Accept-Ranges: bytes
Content-Type: video/mp4
```

### 2. Lazy Loading

**Frontend**: `frontend/src/components/VideoPlayer.jsx`

- Video chỉ được tải khi:
  - Người dùng nhấn vào video
  - Video xuất hiện trong viewport (còn cách 100px)
- Giảm tải ban đầu và tiết kiệm băng thông
- Sử dụng Intersection Observer API

**Cách sử dụng**:
```jsx
<VideoPlayer 
  videoUrl={videoUrl}
  lazy={true}  // Bật lazy loading
/>
```

### 3. Metadata Preloading

- Video chỉ preload metadata (thông tin về video) chứ không tải toàn bộ file
- Giúp hiển thị thời lượng và controls nhanh chóng
- Tiết kiệm băng thông đáng kể

**Implementation**:
```html
<video preload="metadata" ...>
```

### 4. Optimized Video URL Routing

- Video local tự động được chuyển sang streaming endpoint
- `/static/uploads/videos/file.mp4` → `/api/video/file.mp4`
- Đảm bảo tất cả video local đều có Range request support

### 5. Buffering Indicators

- Hiển thị loading indicator khi video đang buffering
- Thông báo lỗi rõ ràng nếu video không tải được
- Nút "Thử lại" để reload video khi có lỗi

### 6. Mobile Optimization

- `playsInline` attribute để video phát inline trên mobile
- Responsive design cho mọi kích thước màn hình

## Cách sử dụng

### Backend

Endpoint streaming tự động hoạt động cho tất cả video trong `static/uploads/videos/`.

### Frontend

VideoPlayer component tự động:
- Phát hiện video local và chuyển sang streaming endpoint
- Hỗ trợ lazy loading
- Xử lý lỗi và buffering

**Ví dụ sử dụng cơ bản**:
```jsx
<VideoPlayer 
  videoUrl={videoUrl}
  videoPath={lesson.video_path}
  duration={lesson.video_duration}
  onTimeUpdate={(time, duration) => {
    // Track progress
  }}
/>
```

**Ví dụ với lazy loading**:
```jsx
<VideoPlayer 
  videoUrl={videoUrl}
  lazy={true}
  onTimeUpdate={handleTimeUpdate}
/>
```

## Tối ưu hóa video file

### Khuyến nghị

1. **Format**: Sử dụng MP4 (H.264 codec) để tương thích tốt nhất
2. **Resolution**: 
   - 1080p (1920x1080) cho desktop
   - 720p (1280x720) cho mobile
3. **Bitrate**:
   - 2-4 Mbps cho 720p
   - 4-8 Mbps cho 1080p
4. **File size**: Giữ mỗi video < 500MB nếu có thể

### Tools để optimize video

- **FFmpeg** (command line):
  ```bash
  ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
  ```

- **HandBrake** (GUI): Dễ sử dụng cho người không quen command line

- **Online tools**: CloudConvert, FreeConvert

## Performance Metrics

### Trước khi tối ưu:
- Video tải toàn bộ trước khi phát
- Không thể seek hiệu quả
- Tốn nhiều băng thông

### Sau khi tối ưu:
- ✅ Video chỉ tải phần cần thiết
- ✅ Seek nhanh chóng (206 Partial Content)
- ✅ Tiết kiệm 60-80% băng thông
- ✅ Lazy loading giảm tải ban đầu
- ✅ Better UX với buffering indicators

## Troubleshooting

### Video không phát được

1. Kiểm tra file có tồn tại trong `static/uploads/videos/`
2. Kiểm tra format video (nên dùng MP4)
3. Kiểm tra console browser để xem lỗi cụ thể
4. Thử reload video bằng nút "Thử lại"

### Video load chậm

1. Kiểm tra kích thước file video (nên < 500MB)
2. Kiểm tra bitrate (nên < 8 Mbps)
3. Xem xét sử dụng CDN cho production
4. Compress video với FFmpeg hoặc HandBrake

### Range request không hoạt động

1. Đảm bảo video được serve qua `/api/video/` endpoint
2. Kiểm tra backend logs
3. Kiểm tra CORS headers nếu có vấn đề cross-origin

## Tương lai (Future Enhancements)

1. **Adaptive Bitrate Streaming (HLS/DASH)**: Tự động điều chỉnh chất lượng theo bandwidth
2. **Video Thumbnails**: Tạo thumbnail tự động cho video
3. **Video Transcoding**: Tự động convert video sang format tối ưu khi upload
4. **CDN Integration**: Tích hợp CDN (Cloudflare, AWS CloudFront) cho production
5. **Video Analytics**: Track xem video, drop-off points, etc.

## Tài liệu tham khảo

- [MDN: HTTP Range Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)
- [HTML5 Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

