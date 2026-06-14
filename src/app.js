const storageKey = "praise-layout-mvp-v10";
const songKeyStorageKey = "praise-layout-song-key-memory-v1";
const fileDbName = "praise-layout-files";
const fileStoreName = "files";

const today = new Date();
const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  .toISOString()
  .slice(0, 10);

const state = {
  setlist: {
    title: "",
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
const legacyDefaultSetlistTitle = "주일 2부 예배 찬양 콘티";
const keyOptions = [
  "",
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
  "Cm",
  "C#m",
  "Dbm",
  "Dm",
  "D#m",
  "Ebm",
  "Em",
  "Fm",
  "F#m",
  "Gbm",
  "Gm",
  "G#m",
  "Abm",
  "Am",
  "A#m",
  "Bbm",
  "Bm",
];
const recommendationCatalog = [
  { title: "주 은혜임을", key: "E", tags: ["은혜", "고백", "회복", "잔잔"], reason: "은혜를 고백하는 흐름에 자연스럽게 이어집니다." },
  { title: "시간을 뚫고", key: "D", tags: ["기다림", "신뢰", "고백", "잔잔"], reason: "하나님의 일하심을 신뢰하는 분위기와 잘 맞습니다." },
  { title: "주님의 시선", key: "F", tags: ["헌신", "시선", "고백", "잔잔"], reason: "헌신과 고백 중심의 콘티에서 연결감이 좋습니다." },
  { title: "나는 주를 섬기는 것에 후회가 없습니다", key: "F", tags: ["헌신", "결단", "고백", "회복"], reason: "섬김과 결단의 메시지를 강하게 이어갈 수 있습니다." },
  { title: "원하고 바라고 기도합니다", key: "F", tags: ["기도", "소망", "고백", "잔잔"], reason: "기도와 소망의 주제를 부드럽게 확장합니다." },
  { title: "Way Maker", key: "E", tags: ["신뢰", "선포", "소망", "예배"], reason: "하나님의 길을 선포하는 분위기로 전환하기 좋습니다." },
  { title: "주가 일하시네", key: "C", tags: ["신뢰", "소망", "고백", "잔잔"], reason: "기다림과 신뢰의 메시지를 같은 결로 이어줍니다." },
  { title: "예수 아름다우신", key: "A", tags: ["예수", "경배", "찬양", "잔잔"], reason: "예수님께 초점을 모으는 경배 흐름에 적합합니다." },
  { title: "아무것도 두려워 말라", key: "C", tags: ["위로", "평안", "신뢰", "회복"], reason: "위로와 평안의 메시지가 필요한 콘티에 잘 맞습니다." },
  { title: "꽃들도", key: "D", tags: ["감사", "소망", "고백", "잔잔"], reason: "감사와 소망을 차분하게 고백하는 흐름을 만듭니다." },
  { title: "하나님의 부르심", key: "E", tags: ["부르심", "헌신", "결단", "고백"], reason: "부르심과 헌신의 주제를 분명하게 이어줍니다." },
  { title: "나의 한숨을 바꾸셨네", key: "C", tags: ["회복", "위로", "은혜", "소망"], reason: "회복과 위로가 필요한 예배 흐름에 적합합니다." },
  { title: "주의 나라가 임할 때", key: "D", tags: ["선포", "하나님나라", "부흥", "예배"], reason: "공동체적 선포와 부흥의 에너지를 살릴 수 있습니다." },
  { title: "나는 예배자입니다", key: "F", tags: ["예배", "정체성", "고백", "헌신"], reason: "예배자로 서는 고백을 명확하게 이어줍니다." },
  { title: "내 모습 이대로", key: "E", tags: ["은혜", "회복", "고백", "잔잔"], reason: "있는 모습 그대로 나아가는 고백과 잘 맞습니다." },
  { title: "마라나타", key: "G", tags: ["소망", "재림", "선포", "예배"], reason: "소망과 선포의 방향으로 예배를 끌어올립니다." },
  { title: "주만 의지해", key: "G", tags: ["신뢰", "고백", "평안", "잔잔"], reason: "하나님만 의지하는 메시지를 단순하게 이어줍니다." },
  { title: "은혜", key: "C", tags: ["은혜", "감사", "고백", "회복"], reason: "은혜와 감사의 주제를 직접적으로 강화합니다." },
  { title: "충만", key: "D", tags: ["성령", "충만", "기도", "예배"], reason: "성령의 임재와 충만을 구하는 흐름에 적합합니다." },
  { title: "주 품에", key: "G", tags: ["위로", "평안", "신뢰", "잔잔"], reason: "평안과 위로의 분위기를 안정적으로 이어줍니다." },
  { title: "내 삶의 이유라", key: "E", tags: ["예수", "고백", "헌신", "예배"], reason: "예수님을 삶의 이유로 고백하는 메시지와 연결됩니다." },
  { title: "그 사랑", key: "G", tags: ["사랑", "십자가", "은혜", "고백"], reason: "십자가 사랑과 은혜의 주제를 깊게 이어갑니다." },
  { title: "찬양하세", key: "A", tags: ["기쁨", "찬양", "선포", "빠른"], reason: "밝고 힘 있는 찬양 흐름으로 전환하기 좋습니다." },
  { title: "기뻐하며 왕께", key: "G", tags: ["기쁨", "찬양", "선포", "빠른"], reason: "예배 초반의 기쁨과 선포 분위기에 잘 맞습니다." },
  { title: "예수 열방의 소망", key: "A", tags: ["예수", "소망", "선포", "찬양"], reason: "예수님을 소망으로 선포하는 흐름을 만들 수 있습니다." },
  { title: "나 주님의 기쁨되기 원하네", key: "G", tags: ["헌신", "고백", "결단", "잔잔"], reason: "헌신과 순종의 결단으로 자연스럽게 이어집니다." },
];
const recommendationKeywordMap = {
  감사: ["감사", "은혜", "기쁨"],
  기도: ["기도", "소망", "신뢰"],
  기쁨: ["기쁨", "찬양", "빠른", "선포"],
  빠른: ["빠른", "기쁨", "찬양", "선포"],
  밝은: ["기쁨", "찬양", "빠른"],
  선포: ["선포", "찬양", "예배"],
  은혜: ["은혜", "감사", "회복"],
  회복: ["회복", "위로", "은혜"],
  위로: ["위로", "평안", "회복"],
  평안: ["평안", "위로", "신뢰"],
  신뢰: ["신뢰", "소망", "고백"],
  소망: ["소망", "신뢰", "선포"],
  헌신: ["헌신", "결단", "고백"],
  결단: ["결단", "헌신", "고백"],
  예배: ["예배", "고백", "경배"],
  경배: ["경배", "예배", "예수"],
  예수: ["예수", "경배", "고백"],
  십자가: ["십자가", "사랑", "은혜"],
  사랑: ["사랑", "은혜", "고백"],
  성령: ["성령", "충만", "기도"],
  부흥: ["부흥", "선포", "하나님나라"],
};

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
  fileNameHint: document.querySelector("#fileNameHint"),
};

function createSong(index) {
  return {
    id: crypto.randomUUID(),
    order: index + 1,
    title: "",
    key: "",
    youtubeUrl: "",
    recommendationHint: "",
    recommendationResult: "",
    recommendationStatus: "",
    analysisStatus: "",
    flow: "",
    fileId: "",
  };
}

function ensureSongCount(count) {
  while (state.songs.length < count) {
    state.songs.push(createSong(state.songs.length));
  }
  state.songs = state.songs.slice(0, count).map((song, index) => ({
    ...createSong(index),
    ...song,
    order: index + 1,
  }));
}

function getFile(song) {
  return state.files.find((file) => file.id === song.fileId);
}

function getCleanBaseName() {
  const title = state.setlist.title.replace(/[^\uac00-\ud7a3a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `${title || "콘티"}_${state.setlist.worshipDate || "date"}_A3`;
}

function getCleanFileName(extension = "pdf") {
  return `${getCleanBaseName()}.${extension}`;
}

function getPageHeading() {
  return [state.setlist.worshipDate, state.setlist.title].filter(Boolean).join("  |  ");
}

function getSongLabel(song) {
  const title = song.title || "곡명 없음";
  return song.key ? `${song.order}. ${title} [${song.key}]` : `${song.order}. ${title}`;
}

function getSongPages() {
  const perPage = state.layout.songsPerPage;
  const pages = [];
  for (let index = 0; index < state.songs.length; index += perPage) {
    pages.push(state.songs.slice(index, index + perPage));
  }
  return pages;
}

function saveSnapshot() {
  const serializable = {
    ...state,
    files: state.files.map(({ objectUrl, ...file }) => file),
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(serializable));
  } catch {
    // Large image fallbacks can exceed browser storage quotas; the current session still works.
  }
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
    migratePlaceholderDefaults();
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function openFileDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = indexedDB.open(fileDbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(fileStoreName)) {
        db.createObjectStore(fileStoreName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open file storage."));
  });
}

async function runFileStore(mode, task) {
  const db = await openFileDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(fileStoreName, mode);
    const store = transaction.objectStore(fileStoreName);
    let result;

    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("File storage transaction failed."));
    };

    result = task(store);
  });
}

function storeFileBlob(fileMeta, file) {
  return runFileStore("readwrite", (store) => {
    store.put({
      id: fileMeta.id,
      name: fileMeta.name,
      type: fileMeta.type,
      size: fileMeta.size,
      blob: file,
      updatedAt: Date.now(),
    });
  });
}

function readStoredFile(fileId) {
  return runFileStore(
    "readonly",
    (store) =>
      new Promise((resolve, reject) => {
        const request = store.get(fileId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error("Could not read stored file."));
      }),
  );
}

function deleteStoredFile(fileId) {
  if (!fileId) return Promise.resolve();
  return runFileStore("readwrite", (store) => {
    store.delete(fileId);
  });
}

async function restoreStoredFileObjectUrls() {
  let didRestore = false;

  for (const file of state.files) {
    if (file.objectUrl || file.dataUrl || !file.id) continue;
    const stored = await readStoredFile(file.id);
    if (!stored?.blob) continue;
    file.name = file.name || stored.name;
    file.type = file.type || stored.type;
    file.size = file.size || stored.size;
    file.objectUrl = file.type.startsWith("image/") ? URL.createObjectURL(stored.blob) : "";
    didRestore = true;
  }

  return didRestore;
}

function getFileSource(file) {
  if (!file || file.type === "application/pdf") return "";
  return file.objectUrl || file.dataUrl || "";
}

function removeFile(fileId) {
  if (!fileId) return;
  const index = state.files.findIndex((file) => file.id === fileId);
  if (index === -1) return;

  const [file] = state.files.splice(index, 1);
  if (file.objectUrl) URL.revokeObjectURL(file.objectUrl);
  deleteStoredFile(fileId).catch(() => {});
}

function normalizeSongTitle(title) {
  return String(title || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getSongKeyMemory() {
  try {
    return JSON.parse(localStorage.getItem(songKeyStorageKey) || "{}");
  } catch {
    return {};
  }
}

function rememberSongKey(title, key) {
  const normalizedTitle = normalizeSongTitle(title);
  if (!normalizedTitle || !key) return;
  const memory = getSongKeyMemory();
  memory[normalizedTitle] = {
    title: title.trim(),
    key,
    updatedAt: Date.now(),
  };
  localStorage.setItem(songKeyStorageKey, JSON.stringify(memory));
}

function findRememberedKey(title) {
  const normalizedTitle = normalizeSongTitle(title);
  if (!normalizedTitle) return "";
  return getSongKeyMemory()[normalizedTitle]?.key || "";
}

function migratePlaceholderDefaults() {
  if (state.setlist.title === legacyDefaultSetlistTitle) {
    state.setlist.title = "";
  }

  state.songs = state.songs.map((song, index) => {
    if (song.title !== sampleTitles[index]) return song;
    return { ...song, title: "" };
  });
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
          <div class="song-card-body">
            <div class="song-title-row">
              <span class="song-index">${song.order}</span>
              <div class="title-key-grid">
                <label class="field-block title-field">
                  <input data-field="title" value="${escapeHtml(song.title)}" aria-label="곡명" placeholder="찬양 이름을 입력해주세요" />
                </label>
                <label class="field-block key-field">
                  <span>Key</span>
                  <select data-field="key" aria-label="Key">
                    ${keyOptions.map((key) => `<option value="${escapeHtml(key)}" ${song.key === key ? "selected" : ""}>${key || "선택"}</option>`).join("")}
                  </select>
                </label>
              </div>
            </div>
            <div class="song-analysis-row">
              <label class="file-drop key-audio-drop">
                <input data-action="key-audio-upload" type="file" accept="audio/*" />
                오디오로 Key 추정
              </label>
              <span class="analysis-status">${escapeHtml(song.analysisStatus || "Key는 직접 선택하거나 오디오 파일로 추정할 수 있습니다.")}</span>
            </div>
            <div class="song-recommendation-box">
              <div class="recommendation-head">
                <strong>비슷한 찬양 추천</strong>
                <span>자동 추천</span>
              </div>
              <div class="recommendation-input-row">
                <textarea data-field="recommendationHint" rows="2" aria-label="추천 힌트" placeholder="분위기, 주제, 가사 일부를 적으면 추천 정확도가 올라갑니다">${escapeHtml(song.recommendationHint)}</textarea>
                <button data-action="song-recommend" class="mini-button" type="button">추천받기</button>
              </div>
              <span class="analysis-status">${escapeHtml(song.recommendationStatus || "곡명, Key, 추천 힌트를 기준으로 앱 안에서 바로 추천합니다.")}</span>
              ${song.recommendationResult ? `<pre class="recommendation-result">${escapeHtml(song.recommendationResult)}</pre>` : ""}
            </div>
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
  const source = getFileSource(file);
  if (source) return `<img src="${escapeHtml(source)}" alt="${escapeHtml(file.name)} 미리보기" />`;
  return `<span>${escapeHtml(file.name)}<br />이전 세션 파일은 다시 업로드하면 미리보기가 표시됩니다.</span>`;
}

function renderPreview() {
  updatePrintPageRule();
  const perPage = state.layout.songsPerPage;
  const pages = getSongPages();

  els.previewCanvas.innerHTML = pages
    .map(
      (songs) => `
        <div class="a3-page ${state.layout.orientation} ${state.layout.marginMode}">
          <div class="a3-page-heading">${escapeHtml(getPageHeading())}</div>
          <div class="a3-page-body ${state.layout.orientation} layout-${perPage}">
            ${songs.map(renderSlot).join("")}
          </div>
        </div>
      `,
    )
    .join("");

  const hasSmallWarning = perPage === 4 || state.songs.some((song) => getFile(song)?.type === "application/pdf");
  els.warningBox.hidden = !hasSmallWarning;
  els.warningBox.textContent =
    "현재 설정은 악보가 작게 보일 수 있어요. 코드가 복잡한 곡은 A3 1장에 2곡 배치를 추천합니다.";

  els.fileNameHint.textContent = getCleanFileName();
}

async function downloadJpgPages() {
  renderPreview();

  const button = document.querySelector("#jpgButton");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "JPG 생성 중";

  try {
    const pages = getSongPages();
    const downloads = [];
    for (let index = 0; index < pages.length; index += 1) {
      const canvas = await renderJpgCanvas(pages[index]);
      const blob = await canvasToJpgBlob(canvas);
      const pageSuffix = pages.length > 1 ? `_p${String(index + 1).padStart(2, "0")}` : "";
      downloads.push({
        blob,
        fileName: `${getCleanBaseName()}${pageSuffix}.jpg`,
      });
    }
    await downloadBlobSequence(downloads);
  } catch (error) {
    alert("JPG 파일을 만드는 중 문제가 발생했습니다. 악보 이미지를 다시 업로드한 뒤 시도해 주세요.");
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function renderJpgCanvas(songs) {
  const isPortrait = state.layout.orientation === "portrait";
  const canvas = document.createElement("canvas");
  canvas.width = isPortrait ? 1697 : 2400;
  canvas.height = isPortrait ? 2400 : 1697;

  const ctx = canvas.getContext("2d");
  const scale = canvas.width / (isPortrait ? 790 : 1120);
  const margin = getCanvasMargin(scale);
  const gap = 10 * scale;
  const headingHeight = 28 * scale;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawJpgPageHeading(ctx, canvas.width, margin, headingHeight, scale);

  const rects = getSlotRects(canvas.width, canvas.height, state.layout.songsPerPage, margin, gap, headingHeight);
  for (let index = 0; index < songs.length; index += 1) {
    await drawJpgSlot(ctx, songs[index], rects[index], scale);
  }

  return canvas;
}

function getCanvasMargin(scale) {
  const margins = {
    tight: 12,
    normal: 20,
    wide: 34,
  };
  return (margins[state.layout.marginMode] || margins.normal) * scale;
}

function drawJpgPageHeading(ctx, width, margin, height, scale) {
  ctx.save();
  ctx.fillStyle = "#182230";
  ctx.font = `900 ${12 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(getPageHeading(), width / 2, margin + height / 2, width - margin * 2);
  ctx.restore();
}

function getSlotRects(width, height, count, margin, gap, headingHeight = 0) {
  const isPortrait = state.layout.orientation === "portrait";
  let columns = 1;
  let rows = 1;

  if (count === 2) {
    columns = isPortrait ? 1 : 2;
    rows = isPortrait ? 2 : 1;
  } else if (count === 3) {
    columns = isPortrait ? 1 : 3;
    rows = isPortrait ? 3 : 1;
  } else if (count >= 4) {
    columns = 2;
    rows = 2;
  }

  const innerWidth = width - margin * 2;
  const innerHeight = height - margin * 2 - headingHeight - gap;
  const slotWidth = (innerWidth - gap * (columns - 1)) / columns;
  const slotHeight = (innerHeight - gap * (rows - 1)) / rows;
  const rects = [];

  for (let index = 0; index < count; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    rects.push({
      x: margin + column * (slotWidth + gap),
      y: margin + headingHeight + gap + row * (slotHeight + gap),
      width: slotWidth,
      height: slotHeight,
    });
  }

  return rects;
}

async function drawJpgSlot(ctx, song, rect, scale) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#dfe5ee";
  ctx.lineWidth = Math.max(1, scale);
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

  let contentY = rect.y;
  let contentHeight = rect.height;

  if (state.layout.showMeta) {
    const metaHeight = 32 * scale;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(rect.x, rect.y, rect.width, metaHeight);
    ctx.strokeStyle = "#edf0f5";
    ctx.beginPath();
    ctx.moveTo(rect.x, rect.y + metaHeight);
    ctx.lineTo(rect.x + rect.width, rect.y + metaHeight);
    ctx.stroke();
    ctx.fillStyle = "#182230";
    ctx.font = `900 ${13 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textBaseline = "middle";
    drawClampedLine(ctx, getSongLabel(song), rect.x + 9 * scale, rect.y + metaHeight / 2, rect.width - 18 * scale);
    contentY += metaHeight;
    contentHeight -= metaHeight;
  }

  const hasFlow = state.layout.showMeta && Boolean(song.flow);
  let flowHeight = 0;
  if (hasFlow) {
    const flowPadding = 10 * scale;
    ctx.font = `800 ${24 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    const lineHeight = 31 * scale;
    const flowLines = getWrappedLines(ctx, song.flow, rect.width - flowPadding * 2, 4);
    flowHeight = Math.min(rect.height * 0.48, flowLines.length * lineHeight + flowPadding * 2);
    contentHeight -= flowHeight;
  }

  const bodyPadding = 4 * scale;
  const frame = {
    x: rect.x + bodyPadding,
    y: contentY + bodyPadding,
    width: rect.width - bodyPadding * 2,
    height: contentHeight - bodyPadding * 2,
  };
  await drawSheetImage(ctx, song, frame, scale);

  if (hasFlow) {
    const flowY = rect.y + rect.height - flowHeight;
    ctx.fillStyle = "#fbfcfe";
    ctx.fillRect(rect.x, flowY, rect.width, flowHeight);
    ctx.strokeStyle = "#edf0f5";
    ctx.beginPath();
    ctx.moveTo(rect.x, flowY);
    ctx.lineTo(rect.x + rect.width, flowY);
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.font = `800 ${24 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textBaseline = "top";
    drawWrappedText(ctx, song.flow, rect.x + 10 * scale, flowY + 8 * scale, rect.width - 20 * scale, 31 * scale, Math.max(1, Math.floor((flowHeight - 16 * scale) / (31 * scale))));
  }

  ctx.restore();
}

async function drawSheetImage(ctx, song, frame, scale) {
  const file = getFile(song);
  const fileSource = getFileSource(file);
  if (fileSource) {
    const image = await loadImage(fileSource);
    drawImageContain(ctx, image, frame.x, frame.y, frame.width, frame.height);
    return;
  }

  if (file?.type === "application/pdf") {
    drawCenteredPlaceholder(ctx, `PDF\n${file.name}`, frame, "#bc3b55", scale);
    return;
  }

  drawFallbackSheet(ctx, frame, scale);
}

function drawImageContain(ctx, image, x, y, width, height) {
  const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * ratio;
  const drawHeight = image.naturalHeight * ratio;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawFallbackSheet(ctx, frame, scale) {
  const insetX = frame.width * 0.03;
  const insetY = frame.height * 0.03;
  const x = frame.x + insetX;
  const y = frame.y + insetY;
  const width = frame.width - insetX * 2;
  const height = frame.height - insetY * 2;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#d5dce7";
  ctx.lineWidth = Math.max(1, scale);
  ctx.strokeRect(x, y, width, height);

  ctx.strokeStyle = "#eef2f6";
  ctx.lineWidth = Math.max(1, scale);
  for (let lineY = y + 18 * scale; lineY < y + height; lineY += 18 * scale) {
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(22, 112, 100, 0.18)";
  ctx.beginPath();
  ctx.moveTo(x + width * 0.1, y);
  ctx.lineTo(x + width * 0.1, y + height);
  ctx.stroke();
}

function drawCenteredPlaceholder(ctx, text, frame, color, scale) {
  const lines = text.split("\n");
  const lineHeight = 18 * scale;
  ctx.fillStyle = color;
  ctx.font = `900 ${13 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, index) => {
    ctx.fillText(line, frame.x + frame.width / 2, frame.y + frame.height / 2 + (index - (lines.length - 1) / 2) * lineHeight, frame.width * 0.86);
  });
  ctx.textAlign = "start";
}

function drawClampedLine(ctx, text, x, y, maxWidth) {
  let output = text;
  while (ctx.measureText(output).width > maxWidth && output.length > 1) {
    output = `${output.slice(0, -2)}…`;
  }
  ctx.fillText(output, x, y);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const lines = getWrappedLines(ctx, text, maxWidth, maxLines);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, maxWidth, lineHeight * maxLines);
  ctx.clip();
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
  ctx.restore();
}

function getWrappedLines(ctx, text, maxWidth, maxLines = 99) {
  const lines = [];
  const paragraphs = String(text || "").split(/\n/);

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push("");
      return;
    }

    let line = "";
    Array.from(paragraph).forEach((char) => {
      const next = `${line}${char}`;
      if (ctx.measureText(next).width <= maxWidth || !line) {
        line = next;
      } else {
        lines.push(line.trimEnd());
        line = char.trimStart();
      }
    });
    if (line) lines.push(line.trimEnd());
  });

  if (lines.length <= maxLines) return lines;
  const trimmed = lines.slice(0, maxLines);
  trimmed[trimmed.length - 1] = `${trimmed[trimmed.length - 1].replace(/…$/, "")}…`;
  return trimmed;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function canvasToJpgBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create JPG blob."));
    }, "image/jpeg", 0.92);
  });
}

function downloadBlob(blob, fileName) {
  return downloadBlobSequence([{ blob, fileName }]);
}

async function downloadBlobSequence(downloads) {
  const items = downloads.map(({ blob, fileName }) => ({
    fileName,
    url: URL.createObjectURL(blob),
  }));

  for (let index = 0; index < items.length; index += 1) {
    triggerDownload(items[index].url, items[index].fileName);
    if (index < items.length - 1) await wait(850);
  }

  setTimeout(() => {
    items.forEach(({ url }) => URL.revokeObjectURL(url));
  }, 60000);
}

function triggerDownload(url, fileName) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
              <strong>${escapeHtml(getSongLabel(song))}</strong>
            </div>`
          : ""
      }
      <div class="slot-body">
        <div class="sheet-frame">
          ${getFileSource(file) ? `<img src="${escapeHtml(getFileSource(file))}" alt="${escapeHtml(song.title)} 악보" />` : '<div class="fallback-sheet" aria-label="악보 자리"></div>'}
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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function normalizeKeyName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = raw.replace(/♯/g, "#").replace(/♭/g, "b");
  const match = normalized.match(/^([A-Ga-g])([#b]?)(m?)$/);
  if (!match) return "";
  return `${match[1].toUpperCase()}${match[2]}${match[3] ? "m" : ""}`;
}

function normalizeRecommendationText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\uac00-\ud7a3a-z0-9#b\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRecommendationTags(song) {
  const text = normalizeRecommendationText([song.title, song.recommendationHint, song.flow].filter(Boolean).join(" "));
  const tags = new Set();

  Object.entries(recommendationKeywordMap).forEach(([keyword, mappedTags]) => {
    if (!text.includes(keyword)) return;
    mappedTags.forEach((tag) => tags.add(tag));
  });

  recommendationCatalog.forEach((item) => {
    if (!text || !normalizeRecommendationText(item.title).includes(text)) return;
    item.tags.forEach((tag) => tags.add(tag));
  });

  return [...tags];
}

function getRecommendedSongs(song) {
  const tags = getRecommendationTags(song);
  const currentTitle = normalizeRecommendationText(song.title);
  const normalizedHint = normalizeRecommendationText(song.recommendationHint);
  const hasInput = Boolean(currentTitle || normalizedHint || song.key);

  if (!hasInput) return [];

  return recommendationCatalog
    .map((item, index) => {
      const sameTitle = currentTitle && normalizeRecommendationText(item.title) === currentTitle;
      const tagScore = item.tags.reduce((score, tag) => score + (tags.includes(tag) ? 4 : 0), 0);
      const keyScore = song.key && item.key === song.key ? 2 : 0;
      const titleScore =
        currentTitle &&
        item.tags.some((tag) => currentTitle.includes(tag)) ? 2 : 0;
      const fallbackScore = tags.length ? 0 : Math.max(0, recommendationCatalog.length - index) / 100;
      return {
        ...item,
        score: sameTitle ? -1 : tagScore + keyScore + titleScore + fallbackScore,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ko"))
    .slice(0, 5);
}

function formatRecommendations(recommendations, song) {
  const basis = [
    song.title ? `곡명: ${song.title}` : "",
    song.key ? `Key: ${song.key}` : "",
    song.recommendationHint ? `힌트: ${song.recommendationHint}` : "",
  ].filter(Boolean);

  return [
    `추천 기준: ${basis.join(" / ")}`,
    "",
    ...recommendations.map(
      (item, index) => `${index + 1}. ${item.title} - ${item.reason} - Key 후보: ${item.key}`,
    ),
    "",
    "콘티 팁: 현재 곡의 메시지와 같은 태그를 가진 곡을 앞뒤에 배치하면 예배 흐름이 덜 끊깁니다.",
  ].join("\n");
}

function handleSongRecommendation(song) {
  const recommendations = getRecommendedSongs(song);
  if (!recommendations.length) {
    song.recommendationStatus = "곡명, Key 또는 추천 힌트를 입력해주세요.";
    song.recommendationResult = "";
    renderSongs();
    return;
  }

  song.recommendationResult = formatRecommendations(recommendations, song);
  song.recommendationStatus = "앱 내부 추천 목록에서 비슷한 찬양을 골랐습니다.";
  render();
}

async function analyzeAudioKey(file) {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) throw new Error("Web Audio is not available.");

  const audioContext = new AudioContextConstructor();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    const frameSize = 4096;
    const stepSize = Math.max(frameSize, Math.floor(sampleRate * 1.2));
    const start = duration > 35 ? Math.floor(sampleRate * 5) : 0;
    const end = Math.min(audioBuffer.length - frameSize, start + Math.floor(sampleRate * 120));
    const chroma = Array(12).fill(0);
    let analyzedFrames = 0;

    for (let offset = start; offset < end && analyzedFrames < 72; offset += stepSize) {
      const frame = getMonoFrame(audioBuffer, offset, frameSize);
      const rms = getRms(frame);
      if (rms < 0.012) continue;

      const pitch = detectPitch(frame, sampleRate);
      if (!pitch) continue;

      const midi = Math.round(69 + 12 * Math.log2(pitch.frequency / 440));
      const pitchClass = ((midi % 12) + 12) % 12;
      chroma[pitchClass] += pitch.confidence * rms;
      analyzedFrames += 1;
    }

    if (!chroma.some(Boolean)) {
      throw new Error("Could not detect tonal content.");
    }

    return estimateKeyFromChroma(chroma);
  } finally {
    audioContext.close?.().catch(() => {});
  }
}

function getMonoFrame(audioBuffer, offset, frameSize) {
  const frame = new Float32Array(frameSize);
  const channelCount = Math.min(audioBuffer.numberOfChannels, 2);
  for (let channel = 0; channel < channelCount; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < frameSize; index += 1) {
      frame[index] += (data[offset + index] || 0) / channelCount;
    }
  }
  return frame;
}

function getRms(frame) {
  let sum = 0;
  for (let index = 0; index < frame.length; index += 1) {
    sum += frame[index] * frame[index];
  }
  return Math.sqrt(sum / frame.length);
}

function detectPitch(frame, sampleRate) {
  const minFrequency = 70;
  const maxFrequency = 700;
  const minLag = Math.floor(sampleRate / maxFrequency);
  const maxLag = Math.min(Math.floor(sampleRate / minFrequency), frame.length - 1);
  let bestLag = 0;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;

    for (let index = 0; index < frame.length - lag; index += 1) {
      const a = frame[index];
      const b = frame[index + lag];
      correlation += a * b;
      energyA += a * a;
      energyB += b * b;
    }

    const normalized = correlation / Math.sqrt(energyA * energyB || 1);
    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }

  if (!bestLag || bestCorrelation < 0.38) return null;
  return {
    frequency: sampleRate / bestLag,
    confidence: bestCorrelation,
  };
}

function estimateKeyFromChroma(chroma) {
  const pitchClasses = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const minorProfile = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  const scores = [];

  for (let root = 0; root < 12; root += 1) {
    scores.push({ key: pitchClasses[root], score: correlateKeyProfile(chroma, majorProfile, root) });
    scores.push({ key: `${pitchClasses[root]}m`, score: correlateKeyProfile(chroma, minorProfile, root) });
  }

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const second = scores[1];
  const confidence = Math.max(0, Math.min(0.99, (best.score - second.score + 0.15) / 1.15));
  return {
    key: best.key,
    confidence,
  };
}

function correlateKeyProfile(chroma, profile, root) {
  const chromaSum = chroma.reduce((sum, value) => sum + value, 0) || 1;
  const normalizedChroma = chroma.map((value) => value / chromaSum);
  const profileSum = profile.reduce((sum, value) => sum + value, 0);
  const normalizedProfile = profile.map((value) => value / profileSum);
  let score = 0;
  for (let index = 0; index < 12; index += 1) {
    score += normalizedChroma[index] * normalizedProfile[(index - root + 12) % 12];
  }
  return score;
}

async function handleAudioKeyAnalysis(song, file) {
  if (!file) return;
  song.analysisStatus = "오디오에서 Key를 추정하는 중입니다.";
  renderSongs();

  try {
    const result = await analyzeAudioKey(file);
    song.key = normalizeKeyName(result.key);
    song.analysisStatus = `추정 Key: ${song.key} / 신뢰도 ${Math.round(result.confidence * 100)}%. 실제 콘티 Key와 다르면 수정해주세요.`;
    if (song.title && song.key) rememberSongKey(song.title, song.key);
    render();
  } catch {
    song.analysisStatus = "Key를 추정하지 못했습니다. 더 선명한 오디오 파일을 사용하거나 직접 선택해주세요.";
    renderSongs();
  }
}

async function handleFileList(fileList, songId = "") {
  for (const file of [...fileList]) {
    const item = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      objectUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    };
    try {
      await storeFileBlob(item, file);
    } catch {
      if (file.type.startsWith("image/")) {
        try {
          item.dataUrl = await readFileAsDataUrl(file);
        } catch {
          alert("브라우저 저장 공간 문제로 악보 파일을 장기 저장하지 못했습니다. 현재 화면에서는 계속 사용할 수 있어요.");
        }
      } else {
        alert("브라우저 저장 공간 문제로 악보 파일을 장기 저장하지 못했습니다. 현재 화면에서는 계속 사용할 수 있어요.");
      }
    }

    const previousFileId = songId ? state.songs.find((entry) => entry.id === songId)?.fileId : "";
    if (previousFileId) removeFile(previousFileId);

    state.files.push(item);
    if (songId) {
      const song = state.songs.find((entry) => entry.id === songId);
      if (song) song.fileId = item.id;
    }
  }
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
  document.querySelector("#jpgButton").addEventListener("click", () => {
    downloadJpgPages();
  });

  document.body.addEventListener("input", (event) => {
    const card = event.target.closest("[data-song-id]");
    if (!card || !event.target.dataset.field) return;
    const song = state.songs.find((entry) => entry.id === card.dataset.songId);
    if (!song) return;
    song[event.target.dataset.field] = event.target.value;
    let shouldRenderSongs = false;
    if (event.target.dataset.field === "title" && !song.key) {
      const rememberedKey = findRememberedKey(song.title);
      if (rememberedKey) {
        song.key = rememberedKey;
        shouldRenderSongs = true;
      }
    }
    if ((event.target.dataset.field === "title" || event.target.dataset.field === "key") && song.title && song.key) {
      rememberSongKey(song.title, song.key);
    }
    if (shouldRenderSongs) renderSongs();
    renderPreview();
    saveSnapshot();
  });

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='song-recommend']");
    if (!button) return;
    const card = button.closest("[data-song-id]");
    const song = state.songs.find((entry) => entry.id === card?.dataset.songId);
    if (!song) return;
    button.disabled = true;
    handleSongRecommendation(song);
    button.disabled = false;
  });

  document.body.addEventListener("change", async (event) => {
    const card = event.target.closest("[data-song-id]");
    if (!card) return;
    const song = state.songs.find((entry) => entry.id === card.dataset.songId);
    if (!song) return;

    if (event.target.dataset.field) {
      song[event.target.dataset.field] = event.target.value;
      if (song.title && song.key) rememberSongKey(song.title, song.key);
      render();
      return;
    }

    if (event.target.dataset.action === "single-upload") {
      await handleFileList(event.target.files, song.id);
      event.target.value = "";
      return;
    }

    if (event.target.dataset.action === "key-audio-upload") {
      await handleAudioKeyAnalysis(song, event.target.files?.[0]);
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
  restoreStoredFileObjectUrls()
    .then((didRestore) => {
      if (didRestore) render();
    })
    .catch(() => {});
}

boot();
