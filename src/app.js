const storageKey = "praise-layout-mvp-v10";

const today = new Date();
const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  .toISOString()
  .slice(0, 10);

const state = {
  setlist: {
    title: "주일 2부 예배 찬양 콘티",
    worshipDate: defaultDate,
    songCount: 4,
  },
  layout: {
    orientation: "landscape",
    songsPerPage: 2,
    marginMode: "normal",
    showMeta: true,
  },
  songs: [],
  files: [],
};

const sampleTitles = [
  "주 은혜임을",
  "시간을 뚫고",
  "주님의 시선",
  "나는 주를 섬기는 것에 후회가 없습니다",
];

const els = {
  setlistTitle: document.querySelector("#setlistTitle"),
  worshipDate: document.querySelector("#worshipDate"),
  songCount: document.querySelector("#songCount"),
  songList: document.querySelector("#songList"),
  orientation: document.querySelector("#orientation"),
  songsPerPage: document.querySelector("#songsPerPage"),
  marginMode: document.querySelector("#marginMode"),
  showMeta: document.querySelector("#showMeta"),
  previewCanvas: document.querySelector("#previewCanvas"),
  warningBox: document.querySelector("#warningBox"),
  enteredMetric: document.querySelector("#enteredMetric"),
  matchedMetric: document.querySelector("#matchedMetric"),
  pageMetric: document.querySelector("#pageMetric"),
  fileNameHint: document.querySelector("#fileNameHint"),
};

function createSong(index) {
  return {
    id: crypto.randomUUID(),
    order: index + 1,
    title: sampleTitles[index] || "",
    flow: "",
    fileId: "",
  };
}

function ensureSongCount(count) {
  while (state.songs.length < count) {
    state.songs.push(createSong(state.songs.length));
  }
  state.songs = state.songs.slice(0, count).map((song, index) => ({ ...song, order: index + 1 }));
}

function getFile(song) {
  return state.files.find((file) => file.id === song.fileId);
}

function getCleanFileName() {
  const title = state.setlist.title.replace(/[^\uac00-\ud7a3a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `${title || "콘티"}_${state.setlist.worshipDate || "date"}_A3.pdf`;
}

function saveSnapshot() {
  const serializable = {
    ...state,
    files: state.files.map(({ objectUrl, ...file }) => file),
  };
  localStorage.setItem(storageKey, JSON.stringify(serializable));
}

function loadSnapshot() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.assign(state.setlist, saved.setlist || {});
    Object.assign(state.layout, saved.layout || {});
    state.songs = Array.isArray(saved.songs) ? saved.songs : [];
    state.files = Array.isArray(saved.files) ? saved.files : [];
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function syncControls() {
  els.setlistTitle.value = state.setlist.title;
  els.worshipDate.value = state.setlist.worshipDate;
  els.songCount.value = String(state.setlist.songCount);
  els.orientation.value = state.layout.orientation;
  els.songsPerPage.value = String(state.layout.songsPerPage);
  els.marginMode.value = state.layout.marginMode;
  els.showMeta.checked = state.layout.showMeta;
}

function renderSongs() {
  els.songList.innerHTML = state.songs
    .map((song) => {
      const file = getFile(song);
      return `
        <article class="song-card" data-song-id="${song.id}">
          <header class="song-card-header">
            <span class="song-index">${song.order}</span>
            <div>
              <h3>${escapeHtml(song.title || "새 곡")}</h3>
              <p>${file ? "악보가 연결되었습니다." : "곡명과 흐름을 입력하고 악보를 업로드하세요."}</p>
            </div>
          </header>
          <div class="song-card-body">
            <label class="field-block title-field">
              <span>곡명</span>
              <input data-field="title" value="${escapeHtml(song.title)}" placeholder="예: 주 은혜임을" />
            </label>
            <label class="field-block flow-field">
              <span>곡 흐름</span>
              <textarea data-field="flow" rows="4" placeholder="예: Intro 2마디 → Verse 1 → Chorus x2 → Bridge → Chorus">${escapeHtml(song.flow)}</textarea>
            </label>
            ${
              file
                ? `<div class="upload-panel">
                    <div class="sheet-preview-mini">
                      ${renderFilePreview(file)}
                    </div>
                    <p class="match-copy">${escapeHtml(file.name)}</p>
                  </div>`
                : ""
            }
          </div>
          <div class="song-card-actions">
            <label class="file-drop">
              <input data-action="single-upload" type="file" accept="image/png,image/jpeg,application/pdf" />
              ${file ? "악보 다시 업로드" : "악보 업로드"}
            </label>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderFilePreview(file) {
  if (!file) return "";
  if (file.type === "application/pdf") return `<span class="pdf-placeholder">PDF<br />${escapeHtml(file.name)}</span>`;
  if (file.objectUrl) return `<img src="${file.objectUrl}" alt="${escapeHtml(file.name)} 미리보기" />`;
  return `<span>${escapeHtml(file.name)}<br />이전 세션 파일은 다시 업로드하면 미리보기가 표시됩니다.</span>`;
}

function renderPreview() {
  updatePrintPageRule();
  const perPage = state.layout.songsPerPage;
  const pages = [];
  for (let index = 0; index < state.songs.length; index += perPage) {
    pages.push(state.songs.slice(index, index + perPage));
  }

  els.previewCanvas.innerHTML = pages
    .map(
      (songs) => `
        <div class="a3-page ${state.layout.orientation} ${state.layout.marginMode} layout-${perPage}">
          ${songs.map(renderSlot).join("")}
        </div>
      `,
    )
    .join("");

  const hasSmallWarning = perPage === 4 || state.songs.some((song) => getFile(song)?.type === "application/pdf");
  els.warningBox.hidden = !hasSmallWarning;
  els.warningBox.textContent =
    "현재 설정은 악보가 작게 보일 수 있어요. 코드가 복잡한 곡은 A3 1장에 2곡 배치를 추천합니다.";

  els.fileNameHint.textContent = getCleanFileName();
  els.enteredMetric.textContent = state.songs.filter((song) => song.title).length;
  els.matchedMetric.textContent = state.songs.filter((song) => song.fileId).length;
  els.pageMetric.textContent = pages.length;
}

function updatePrintPageRule() {
  let style = document.querySelector("#dynamicPrintPage");
  if (!style) {
    style = document.createElement("style");
    style.id = "dynamicPrintPage";
    document.head.appendChild(style);
  }
  style.textContent = `@media print { @page { size: A3 ${state.layout.orientation}; margin: 0; } }`;
}

function renderSlot(song) {
  const file = getFile(song);
  const hasFlow = state.layout.showMeta && Boolean(song.flow);
  return `
    <section class="sheet-slot ${hasFlow ? "has-flow" : ""}">
      ${
        state.layout.showMeta
          ? `<div class="slot-meta">
              <strong>${song.order}. ${escapeHtml(song.title || "곡명 없음")}</strong>
            </div>`
          : ""
      }
      <div class="slot-body">
        <div class="sheet-frame">
          ${file && file.objectUrl && file.type !== "application/pdf" ? `<img src="${file.objectUrl}" alt="${escapeHtml(song.title)} 악보" />` : '<div class="fallback-sheet" aria-label="악보 자리"></div>'}
        </div>
      </div>
      ${hasFlow ? `<div class="slot-flow">${escapeHtml(song.flow)}</div>` : ""}
    </section>
  `;
}

function render() {
  syncControls();
  renderSongs();
  renderPreview();
  saveSnapshot();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function handleFileList(fileList, songId = "") {
  [...fileList].forEach((file) => {
    const item = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      objectUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    };
    state.files.push(item);
    if (songId) {
      const song = state.songs.find((entry) => entry.id === songId);
      if (song) song.fileId = item.id;
    }
  });
  render();
}

function bindEvents() {
  ["setlistTitle", "worshipDate"].forEach((key) => {
    els[key].addEventListener("input", (event) => {
      state.setlist[key === "setlistTitle" ? "title" : key] = event.target.value;
      renderPreview();
      saveSnapshot();
    });
  });

  els.songCount.addEventListener("change", (event) => {
    state.setlist.songCount = Number(event.target.value);
    ensureSongCount(state.setlist.songCount);
    render();
  });

  ["orientation", "marginMode"].forEach((key) => {
    els[key].addEventListener("change", (event) => {
      state.layout[key] = event.target.value;
      render();
    });
  });

  els.songsPerPage.addEventListener("change", (event) => {
    state.layout.songsPerPage = Number(event.target.value);
    render();
  });

  els.showMeta.addEventListener("change", (event) => {
    state.layout.showMeta = event.target.checked;
    render();
  });

  document.querySelector("#saveButton").addEventListener("click", () => {
    saveSnapshot();
    alert("현재 콘티가 이 브라우저에 저장되었습니다.");
  });
  document.querySelector("#printButton").addEventListener("click", () => {
    renderPreview();
    window.print();
  });

  document.body.addEventListener("input", (event) => {
    const card = event.target.closest("[data-song-id]");
    if (!card || !event.target.dataset.field) return;
    const song = state.songs.find((entry) => entry.id === card.dataset.songId);
    if (!song) return;
    song[event.target.dataset.field] = event.target.value;
    renderPreview();
    saveSnapshot();
  });

  document.body.addEventListener("change", (event) => {
    const card = event.target.closest("[data-song-id]");
    if (!card) return;
    const song = state.songs.find((entry) => entry.id === card.dataset.songId);
    if (!song) return;

    if (event.target.dataset.action === "single-upload") {
      handleFileList(event.target.files, song.id);
      event.target.value = "";
      return;
    }

  });

}

function boot() {
  loadSnapshot();
  ensureSongCount(state.setlist.songCount);
  bindEvents();
  render();
}

boot();
