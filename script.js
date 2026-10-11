
const songs = [
  {
    title: "Summer Vibes",
    artist: "SoundHelix • Track 1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "linear-gradient(135deg, #7b61ff, #d66dff 55%, #ffb86c)",
    emoji: "☀️"
  },
  {
    title: "Midnight Drive",
    artist: "SoundHelix • Track 2",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "linear-gradient(135deg, #0f9b8e, #45c5d6)",
    emoji: "🌙"
  },
  {
    title: "Dreaming Sky",
    artist: "SoundHelix • Track 3",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "linear-gradient(135deg, #ff719a, #ffbd69)",
    emoji: "☁️"
  }
];

const audio = document.getElementById("audio");
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const albumArt = document.getElementById("albumArt");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");
const playlist = document.getElementById("playlist");
const message = document.getElementById("message");

let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function renderPlaylist() {
  playlist.innerHTML = "";

  songs.forEach((song, index) => {
    const track = document.createElement("button");
    track.className = `track ${index === currentIndex ? "active" : ""}`;
    track.type = "button";
    track.setAttribute("aria-label", `Play ${song.title}`);

    const art = document.createElement("span");
    art.className = "track-art";
    art.style.background = song.color;
    art.textContent = song.emoji;

    const info = document.createElement("span");
    info.className = "track-info";

    const title = document.createElement("span");
    title.className = "track-title";
    title.textContent = song.title;

    const artist = document.createElement("span");
    artist.className = "track-artist";
    artist.textContent = song.artist;

    const number = document.createElement("span");
    number.className = "track-number";
    number.textContent = index === currentIndex && !audio.paused ? "♫" : String(index + 1).padStart(2, "0");

    info.append(title, artist);
    track.append(art, info, number);

    track.addEventListener("click", () => {
      loadSong(index);
      playSong();
    });

    playlist.appendChild(track);
  });
}

function loadSong(index) {
  currentIndex = (index + songs.length) % songs.length;

  const song = songs[currentIndex];
  audio.src = song.url;
  songTitle.textContent = song.title;
  artistName.textContent = song.artist;
  albumArt.style.background = song.color;
  albumArt.querySelector(".art-note").textContent = song.emoji;

  progress.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  message.textContent = "Ready to play";

  renderPlaylist();
}

async function playSong() {
  try {
    await audio.play();
    playBtn.textContent = "Ⅱ";
    playBtn.setAttribute("aria-label", "Pause");
    playBtn.title = "Pause";
    albumArt.classList.add("playing");
    message.textContent = "Now playing";
    renderPlaylist();
  } catch (error) {
    message.textContent = "Song could not play. Check your internet and try again.";
  }
}

function pauseSong() {
  audio.pause();
  playBtn.textContent = "▶";
  playBtn.setAttribute("aria-label", "Play");
  playBtn.title = "Play";
  albumArt.classList.remove("playing");
  message.textContent = "Paused";
  renderPlaylist();
}

function togglePlay() {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

function nextSong() {
  if (isShuffle && songs.length > 1) {
    let nextIndex;

    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentIndex);

    loadSong(nextIndex);
  } else {
    loadSong(currentIndex + 1);
  }

  playSong();
}

function previousSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  loadSong(currentIndex - 1);
  playSong();
}

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", previousSong);

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
  message.textContent = isShuffle ? "Shuffle enabled" : "Shuffle disabled";
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  audio.loop = isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
  message.textContent = isRepeat ? "Repeat enabled" : "Repeat disabled";
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }

  currentTimeEl.textContent = formatTime(audio.currentTime);
});

progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  }
});

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
});

audio.addEventListener("ended", () => {
  if (!isRepeat) {
    nextSong();
  }
});

audio.addEventListener("error", () => {
  message.textContent = "Audio unavailable. Check internet or try another song.";
});

audio.volume = Number(volume.value);
loadSong(0);
