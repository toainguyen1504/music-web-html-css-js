# HƯỚNG DẪN SỬ DỤNG AUDIUS API

## 1. Audius API là gì?

**Audius** là nền tảng nghe nhạc trực tuyến, cung cấp API để lập trình viên lấy dữ liệu bài hát về website của mình.

Website có thể sử dụng Audius API để:
- Lấy danh sách bài hát.
- Tìm kiếm bài hát.
- Lấy tên bài hát, ca sĩ và ảnh bìa.
- Phát nhạc trực tiếp.

**Tài liệu API:** https://docs.audius.co/api/

## 2. Các API thường sử dụng

**API 1 — Lấy danh sách 10 bài hát nổi bật**

https://api.audius.co/v1/tracks/trending?limit=10

**API 2 — Tìm kiếm bài hát**

https://api.audius.co/v1/tracks/search?query=love&limit=10

**API 3 — Lấy danh sách bài hát theo thể loại**

https://api.audius.co/v1/tracks/trending?genre=Pop&limit=10

**API 4 — Phát nhạc**

```text
https://api.audius.co/v1/tracks/{id}/stream
```

Thay `{id}` bằng ID của bài hát lấy được từ API.

**Giải thích tham số:**
- `limit=10`: Lấy tối đa 10 bài hát.
- `query=love`: Tìm kiếm nhạc có từ khóa "love".
- `genre=Pop`: Lọc nhạc thuộc thể loại Pop.
- `id`: Mã định danh của một bài hát.

## 3. Cách lấy dữ liệu bằng JavaScript

**Bước 1:** Sử dụng `fetch()` để gọi API.

```javascript
async function layDanhSachNhac() {
  const url = "https://api.audius.co/v1/tracks/trending?limit=10";

  const response = await fetch(url);
  const result = await response.json();

  console.log(result.data);
}

layDanhSachNhac();
```

**Bước 2:** Nhấn `F12` → `Console` để xem danh sách bài hát.

**Bước 3:** Lấy thông tin từng bài hát.

```javascript
const songs = result.data;

songs.forEach(song => {
  console.log(song.title);     // Tên bài hát
  console.log(song.user.name); // Tên ca sĩ
  console.log(song.id);        // ID bài hát
});
```

*Đặt đoạn code ở bước 3 bên trong hàm `layDanhSachNhac()`, sau khi nhận được `result`.*

## 4. Cách phát nhạc

Sau khi có ID bài hát, sử dụng thẻ HTML:

```html
<audio id="player" controls></audio>
```

JavaScript:

```javascript
const player = document.getElementById("player");

player.src =
  `https://api.audius.co/v1/tracks/${song.id}/stream`;

player.play();
```

Trong đó `song` là bài hát đã lấy từ API. Lệnh `play()` nên chạy khi người dùng nhấn nút phát nhạc.

## 5. Bài tập thực hành

1. Lấy danh sách 20 bài hát từ Audius.
2. Hiển thị tên bài hát và tên ca sĩ lên website.
3. Thêm chức năng tìm kiếm bài hát.
4. Khi nhấn chọn một bài hát, website sẽ phát bài hát đó.

**Lưu ý:** Các em cần có Internet để gọi API. Nếu API không trả dữ liệu, hãy mở F12 → Network để kiểm tra. Một số API có thể giới hạn lượt gọi hoặc yêu cầu API Key; không đưa khóa bí mật vào JavaScript phía trình duyệt.
