"use strict";

// WAVE demo: Audius public read API. No Jamendo client_id.
// Khi bị rate-limit, bạn có thể tạo API Key riêng tại https://api.audius.co/plans
// và điền PUBLIC_API_KEY bên dưới. Không đưa Bearer Token/secret vào frontend.
const PUBLIC_API_KEY = "";
const APP_NAME = "WaveMusicDemo";
const API_HOSTS = [
  "https://api.audius.co/v1",
  "https://discoveryprovider.audius.co/v1"
];

const $ = (selector) => document.querySelector(selector);
const audio = $("#audio");
const songGrid = $("#songGrid");
const statusEl = $("#status");
const songsTitle = $("#songsTitle");
const countText = $("#countText");
const searchInput = $("#searchInput");
const playBtn = $("#playBtn");
const progressEl = $("#progress");
const durationEl = $("#duration");
const currentTimeEl = $("#currentTime");

let songs = [];
let currentIndex = -1;
let selectedGenre = "";
let requestNumber = 0;
let isSeeking = false;
let activeApiHost = API_HOSTS[0];
let streamHostIndex = 0;
let autoResumeOnFallback = false;

function makeParams(extra = {}) {
  const params = new URLSearchParams({ app_name: APP_NAME, ...extra });
  if (PUBLIC_API_KEY.trim()) params.set("api_key", PUBLIC_API_KEY.trim());
  return params;
}

function streamUrl(host, id) {
  return `${host}/tracks/${encodeURIComponent(id)}/stream?${makeParams()}`;
}

function imageUrl(artwork) {
  return artwork?._480x480 || artwork?.["480x480"] ||
    artwork?._150x150 || artwork?.["150x150"] || "";
}

function normalizeTrack(item) {
  if (!item?.id || !item.title || item.is_streamable === false ||
      item.is_streamable === "false" || item.isStreamable === false ||
      item.access?.stream === false || item.is_delete) return null;

  return {
    id: String(item.id),
    name: item.title,
    artist_name: item.user?.name || item.user?.handle || "Nghệ sĩ không rõ",
    image: imageUrl(item.artwork),
    duration: Number(item.duration) || 0
  };
}

async function fetchJson(url, timeoutMs = 11000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Audius REST: GET /tracks/trending, GET /tracks/search
async function getSongs(keyword = "", genre = "") {
  const path = keyword ? "/tracks/search" : "/tracks/trending";
  const params = makeParams({ limit: "24" });
  if (keyword) params.set("query", keyword);
  if (genre) params.set("genre", genre);

  let lastError;
  const hosts = [activeApiHost, ...API_HOSTS.filter((host) => host !== activeApiHost)];
  for (const host of hosts) {
    try {
      const data = await fetchJson(`${host}${path}?${params}`);
      if (!Array.isArray(data?.data)) {
        throw new Error(data?.error?.message || data?.message || "API không trả mảng data.");
      }
      activeApiHost = host;
      return data.data.map(normalizeTrack).filter(Boolean);
    } catch (error) {
      lastError = error;
      console.warn(`Audius ${host} không khả dụng:`, error.message);
    }
  }
  throw new Error(`Không kết nối được Audius API (${lastError?.message || "lỗi mạng"}).`);
}

function updatePlayButton() {
  const playing = !audio.paused && !audio.ended;
  playBtn.textContent = playing ? "❚❚" : "▶";
  playBtn.setAttribute("aria-label", playing ? "Tạm dừng" : "Phát nhạc");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function resetProgress() {
  progressEl.value = "0";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
}

function renderSongs() {
  songGrid.replaceChildren();
  const fragment = document.createDocumentFragment();

  songs.forEach((song, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "song-card";
    card.dataset.index = String(index);
    card.setAttribute("aria-label", `Phát ${song.name} - ${song.artist_name}`);

    if (song.image) {
      const cover = document.createElement("img");
      cover.className = "song-cover";
      cover.src = song.image;
      cover.alt = "";
      cover.loading = "lazy";
      cover.onerror = () => {
        const fallback = document.createElement("div");
        fallback.className = "song-cover song-cover-fallback";
        fallback.textContent = "♫";
        cover.replaceWith(fallback);
      };
      card.appendChild(cover);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "song-cover song-cover-fallback";
      fallback.textContent = "♫";
      card.appendChild(fallback);
    }

    const details = document.createElement("div");
    details.className = "song-details";
    const title = document.createElement("span");
    title.className = "song-title";
    title.textContent = song.name;
    const artist = document.createElement("span");
    artist.className = "song-artist";
    artist.textContent = song.artist_name;
    details.append(title, artist);
    card.appendChild(details);
    card.addEventListener("click", () => selectSong(index, true));
    fragment.appendChild(card);
  });
  songGrid.appendChild(fragment);
}

function selectSong(index, shouldPlay = true) {
  if (index < 0 || index >= songs.length) return;
  const song = songs[index];
  currentIndex = index;
  streamHostIndex = 0;
  autoResumeOnFallback = false;
  audio.pause();
  const orderedHosts = [activeApiHost, ...API_HOSTS.filter((host) => host !== activeApiHost)];
  audio.src = streamUrl(orderedHosts[0], song.id);
  audio.load();
  resetProgress();
  durationEl.textContent = formatTime(song.duration);
  $("#nowTitle").textContent = song.name;
  $("#nowArtist").textContent = song.artist_name;

  const cover = $("#nowCover");
  cover.hidden = !song.image;
  $("#coverPlaceholder").hidden = Boolean(song.image);
  if (song.image) cover.src = song.image;

  document.querySelectorAll(".song-card").forEach((card) => {
    card.classList.toggle("active", Number(card.dataset.index) === index);
  });

  statusEl.textContent = "";
  if (shouldPlay) {
    autoResumeOnFallback = true;
    audio.play().catch((error) => {
      console.warn("Không thể tự phát:", error);
      if (error.name === "NotAllowedError") {
        statusEl.textContent = "Trình duyệt chặn tự phát. Hãy nhấn nút ▶ để nghe.";
      }
    });
  }
  updatePlayButton();
}

async function loadSongs() {
  const myRequest = ++requestNumber;
  const keyword = searchInput.value.trim();
  statusEl.textContent = "Đang tải danh sách bài hát từ Audius...";
  songGrid.replaceChildren();
  countText.textContent = "";
  songsTitle.textContent = keyword ? `Kết quả: “${keyword}”` : "Bài hát nổi bật";
  try {
    const results = await getSongs(keyword, selectedGenre);
    if (myRequest !== requestNumber) return;
    // Chỉ thay queue sau khi request thành công; khi API lỗi bài đang nghe không bị dừng.
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    songs = results;
    currentIndex = -1;
    updatePlayButton();
    resetProgress();
    $("#nowCover").hidden = true;
    $("#coverPlaceholder").hidden = false;
    $("#nowTitle").textContent = "Chưa chọn bài hát";
    $("#nowArtist").textContent = "Chọn một bài để nghe";
    statusEl.textContent = songs.length ? "" : "Chưa tìm thấy bài có thể stream. Hãy thử thể loại hoặc từ khóa khác.";
    countText.textContent = `${songs.length} bài hát`;
    renderSongs();
    if (songs.length) selectSong(0, false);
  } catch (error) {
    if (myRequest !== requestNumber) return;
    console.error(error);
    statusEl.textContent = `${error.message} Hãy kiểm tra kết nối hoặc tạo API key Audius riêng (xem README).`;
  }
}

function togglePlay() {
  if (!songs.length) return;
  if (currentIndex === -1) return selectSong(0, true);
  if (audio.paused) {
    autoResumeOnFallback = true;
    audio.play().catch((error) => {
      console.error(error);
      statusEl.textContent = "Không thể phát bài này. Vui lòng thử bài khác.";
    });
  } else {
    autoResumeOnFallback = false;
    audio.pause();
  }
}

function nextSong() {
  if (songs.length) selectSong((currentIndex + 1) % songs.length, true);
}

function previousSong() {
  if (!songs.length) return;
  if (audio.currentTime > 3) audio.currentTime = 0;
  else selectSong((currentIndex - 1 + songs.length) % songs.length, true);
}

playBtn.addEventListener("click", togglePlay);
$("#prevBtn").addEventListener("click", previousSong);
$("#nextBtn").addEventListener("click", nextSong);
audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);
audio.addEventListener("ended", nextSong);
audio.addEventListener("error", () => {
  if (currentIndex < 0 || !audio.currentSrc) return;
  const hosts = [activeApiHost, ...API_HOSTS.filter((host) => host !== activeApiHost)];
  if (streamHostIndex + 1 < hosts.length) {
    streamHostIndex++;
    const song = songs[currentIndex];
    console.warn("Stream lỗi, thử host Audius dự phòng:", hosts[streamHostIndex]);
    statusEl.textContent = "Đang thử máy chủ phát nhạc dự phòng...";
    audio.src = streamUrl(hosts[streamHostIndex], song.id);
    audio.load();
    if (autoResumeOnFallback) audio.play().catch(console.warn);
  } else {
    statusEl.textContent = "Không phát được bài này từ Audius. Hãy thử bài khác.";
    updatePlayButton();
  }
});
audio.addEventListener("playing", () => { statusEl.textContent = ""; });
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", () => {
  if (!isSeeking) {
    currentTimeEl.textContent = formatTime(audio.currentTime);
    progressEl.value = Number.isFinite(audio.duration) && audio.duration > 0
      ? String(audio.currentTime / audio.duration * 100) : "0";
  }
});
progressEl.addEventListener("input", () => {
  isSeeking = true;
  currentTimeEl.textContent = formatTime(Number(progressEl.value) / 100 * audio.duration);
});
progressEl.addEventListener("change", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = Number(progressEl.value) / 100 * audio.duration;
  }
  isSeeking = false;
});
const volumeEl = $("#volume");
volumeEl.addEventListener("input", () => { audio.volume = Number(volumeEl.value); });
audio.volume = Number(volumeEl.value);

$("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  loadSongs();
});
$("#genreFilters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tag]");
  if (!button) return;
  selectedGenre = button.dataset.tag;
  document.querySelectorAll(".filter").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  loadSongs();
});

loadSongs();
