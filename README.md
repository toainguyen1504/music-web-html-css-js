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

## 6. Hướng dẫn làm chức năng phát nhạc

**Mục tiêu:** Khi người dùng nhấn vào một bài hát, website sẽ phát bài hát đó. Người dùng có thể tạm dừng, tiếp tục và chuyển bài.

### Bước 1: Tạo giao diện phát nhạc (HTML)

```html
<h2>Danh sách bài hát</h2>

<div id="songList"></div>

<h3 id="songName">Chưa chọn bài hát</h3>

<audio id="player" controls></audio>
```

Giải thích:
- `songList`: Nơi hiển thị danh sách bài hát.
- `songName`: Hiển thị tên bài đang phát.
- `audio`: Trình phát nhạc có sẵn của HTML, hỗ trợ phát, tạm dừng, tua và chỉnh âm lượng.

### Bước 2: Gọi API lấy danh sách bài hát (JavaScript)

```javascript
let songs = [];
let currentIndex = 0;

const player = document.getElementById("player");

async function loadSongs() {
  const url =
    "https://api.audius.co/v1/tracks/trending?limit=10";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Không lấy được danh sách nhạc");
  }

  const result = await response.json();

  songs = result.data;

  const list = document.getElementById("songList");

  songs.forEach((song, index) => {
    const button = document.createElement("button");

    button.textContent = song.title;

    button.onclick = () => playSong(index);

    list.appendChild(button);
  });
}

loadSongs().catch(console.error);
```

**Giải thích:**
- `fetch()`: Gọi API lấy danh sách nhạc.
- `songs`: Mảng lưu các bài hát lấy được.
- `forEach()`: Duyệt từng bài hát để tạo nút.
- `onclick`: Khi người dùng nhấn nút, gọi hàm `playSong()`.

### Bước 3: Lập trình phát nhạc

```javascript
function playSong(index) {
  currentIndex = index;

  const song = songs[index];

  const url =
    `https://api.audius.co/v1/tracks/${song.id}/stream`;

  player.src = url;

  document.getElementById("songName").textContent =
    song.title;

  player.play().catch(console.error);
}
```

**Giải thích:**
- `songs[index]`: Lấy bài hát mà người dùng chọn.
- `song.id`: Lấy ID của bài hát.
- `player.src`: Gán đường dẫn nhạc từ Audius API.
- `player.play()`: Bắt đầu phát nhạc.

### Bước 4: Thêm nút chuyển bài

HTML:

```html
<button onclick="prevSong()">Bài trước</button>
<button onclick="nextSong()">Bài tiếp</button>
```

JavaScript:

```javascript
function nextSong() {
  if (songs.length === 0) return;

  currentIndex = (currentIndex + 1) % songs.length;

  playSong(currentIndex);
}

function prevSong() {
  if (songs.length === 0) return;

  currentIndex =
    (currentIndex - 1 + songs.length) % songs.length;

  playSong(currentIndex);
}
```

**Giải thích:**
- `nextSong()`: Chuyển sang bài hát tiếp theo.
- `prevSong()`: Quay lại bài hát trước.
- `currentIndex`: Lưu vị trí bài hát đang phát.
- Toán tử `%`: Giúp quay lại bài đầu tiên khi đã đến bài cuối.

### Bước 5: Tự động chuyển bài khi nhạc kết thúc

```javascript
player.addEventListener("ended", function() {
  nextSong();
});
```

Khi một bài hát kết thúc, JavaScript tự gọi `nextSong()` để phát bài tiếp theo.

### Bước 6: Chạy thử website

1. Mở `index.html` bằng Live Server.
2. Kiểm tra danh sách bài hát đã xuất hiện.
3. Nhấn vào một bài để phát nhạc.
4. Thử tạm dừng, tiếp tục và chuyển bài.
5. Nếu không phát được, mở F12 → Console hoặc Network để kiểm tra lỗi.

**Lưu ý:** Các đoạn HTML và JavaScript trên cần đặt chung trong một trang hoặc liên kết đúng file JS bằng `defer`. JavaScript ở bước 2–5 có thể đặt liên tiếp trong `app.js`. Một số bài hát có thể không hỗ trợ stream hoặc API có thể yêu cầu quyền truy cập.

### Kết quả cần đạt

Học sinh hiểu được quy trình:

**Gọi API → Lấy danh sách bài hát → Chọn bài hát → Lấy ID → Tạo URL stream → Phát nhạc bằng HTML Audio.**
