# WAVE — Audius Music API Demo (bản sửa lỗi Jamendo)

Demo web nghe nhạc bằng HTML/CSS/JavaScript thuần. Đã thay Jamendo sang **Audius API** để không còn dùng client_id thử nghiệm Jamendo 709fa152 bị đình chỉ.

## Cách chạy

1. Giải nén ZIP, mở thư mục `wave-audius-demo` bằng VS Code.
2. Chuột phải vào `index.html` > **Open with Live Server**.
3. Mở URL như `http://127.0.0.1:5500`.
4. Khi danh sách xuất hiện, nhấp ảnh/tên một bài để phát. Nếu API bị hạn chế theo vùng hoặc có lỗi, đọc Console (F12).

Hoặc chạy: `python -m http.server 5500` rồi mở `http://localhost:5500`.

## Cấu trúc

- `index.html`: cấu trúc UI, favicon, liên kết tài liệu.
- `style.css`: style và responsive giữ nguyên từ giao diện WAVE cũ.
- `app.js`: Audius REST API, load/search/genre, stream, play/pause/prev/next/progress/volume, retry máy chủ dự phòng.
- `favicon.svg`: icon tab để không bị lỗi favicon.ico 404.

## API sử dụng

1. Danh sách nổi bật:
   `GET https://api.audius.co/v1/tracks/trending?app_name=WaveMusicDemo&limit=24`
2. Tìm kiếm:
   `GET https://api.audius.co/v1/tracks/search?app_name=WaveMusicDemo&query=love&limit=24`
3. Phát nhạc:
   `GET https://api.audius.co/v1/tracks/{track_id}/stream?app_name=WaveMusicDemo`
4. Danh sách theo thể loại: thêm `&genre=Pop`, `Rock`, `Electronic`, hoặc `Jazz`.

`app.js` dự phòng chuyển sang `https://discoveryprovider.audius.co/v1` nếu host đầu không đáp ứng. URL stream dùng trực tiếp trong HTML5 `<audio>`.

### Nếu API Audius yêu cầu key hoặc bị rate limit

- Tạo API key tại https://api.audius.co/plans hoặc https://audius.co/settings.
- Điền **API Key dành cho frontend** (không phải Bearer Token hay secret) vào `PUBLIC_API_KEY` ở đầu `app.js`.
- Giữ mọi token bí mật ngoài frontend. Có thể cần backend proxy trong bản production nếu muốn kiểm soát giới hạn/độ ổn định.

## Kiểm tra nhanh (F12 > Network)

- Tìm request `tracks/trending`: kỳ vọng HTTP 200, JSON có `data: []`.
- Nhấp bài hát: tìm request `tracks/{id}/stream`; trình duyệt có thể theo redirect.
- Nếu response bị 401/403/429: xem yêu cầu khóa/rate limit ở Audius.
- Nếu danh sách hiển thị nhưng audio lỗi: thử bài khác; một số bài bị giới hạn stream.

## Giới hạn

- Thư viện Audius không tương đương Spotify/Zing, không đảm bảo mọi bài có thể stream.
- Không tải nhạc; tuân thủ điều khoản và quyền nội dung của Audius và nghệ sĩ.
- **Đã kiểm tra cú pháp JavaScript, cấu trúc file và các thao tác danh sách, tìm kiếm, chọn bài, chuyển bài, lọc thể loại trên Chromium với dữ liệu API mô phỏng. Chưa kiểm thử API/stream Audius thật qua Internet trong môi trường tạo ZIP.**

Tài liệu chính thức: https://docs.audius.co/api/ và https://docs.audius.co/sdk/tracks/
