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

function notifyVisit() {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local") || host.startsWith("192.168.");
  if (isLocal || sessionStorage.getItem("praise-layout-visit-notified") === "1") return;

  sessionStorage.setItem("praise-layout-visit-notified", "1");
  fetch("/api/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: `${window.location.pathname}${window.location.search}`,
      title: document.title,
    }),
    keepalive: true,
  }).catch(() => {});
}

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
const markerOptions = ["V", "Ch", "P.C", "Br"];
let draggingMarker = {
  songId: "",
  markerId: "",
  frame: null,
  marker: null,
  pointerId: 0,
  mode: "",
  startX: 0,
  startY: 0,
  startSize: 1,
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

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  const randomPart = window.crypto?.getRandomValues ? window.crypto.getRandomValues(new Uint32Array(2)).join("") : Math.random().toString(36).slice(2);
  return `id-${Date.now().toString(36)}-${randomPart}`;
}

function createSong(index) {
  return {
    id: createId(),
    order: index + 1,
    title: "",
    key: "",
    modulationKey: "",
    flow: "",
    markers: [],
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

function applySingleSongLayout() {
  if (state.setlist.songCount !== 1) return;
  state.layout.songsPerPage = 1;
  state.layout.orientation = "portrait";
}

function getFile(song) {
  return state.files.find((file) => file.id === song.fileId);
}

function getCleanBaseName() {
  const title = state.setlist.title.replace(/[^\uac00-\ud7a3a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `${title || "콘티"}_${state.setlist.worshipDate || "date"}_A3`;
}

function getCleanSetlistTitle() {
  return state.setlist.title.replace(/[^\uac00-\ud7a3a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "찬양팀_콘티";
}

function getCleanFileName(extension = "pdf") {
  return `${getCleanBaseName()}.${extension}`;
}

function getPdfFileName() {
  return `${getCleanSetlistTitle()}.pdf`;
}

function getPageHeading() {
  return [state.setlist.worshipDate, state.setlist.title].filter(Boolean).join("  |  ");
}

function getSongLabel(song) {
  const title = song.title || "곡명 없음";
  const keyLabel = song.key && song.modulationKey && song.key !== song.modulationKey ? `${song.key} → ${song.modulationKey}` : song.key;
  return keyLabel ? `${song.order}. ${title} [${keyLabel}]` : `${song.order}. ${title}`;
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

function rememberSongKey(title, key, modulationKey = "") {
  const normalizedTitle = normalizeSongTitle(title);
  if (!normalizedTitle || !key) return;
  const memory = getSongKeyMemory();
  memory[normalizedTitle] = {
    title: title.trim(),
    key,
    modulationKey,
    updatedAt: Date.now(),
  };
  localStorage.setItem(songKeyStorageKey, JSON.stringify(memory));
}

function findRememberedKey(title) {
  const normalizedTitle = normalizeSongTitle(title);
  if (!normalizedTitle) return "";
  return getSongKeyMemory()[normalizedTitle]?.key || "";
}

function findRememberedModulationKey(title) {
  const normalizedTitle = normalizeSongTitle(title);
  if (!normalizedTitle) return "";
  return getSongKeyMemory()[normalizedTitle]?.modulationKey || "";
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
  els.songList.className = `song-list song-list-count-${state.songs.length}`;
  els.songList.innerHTML = state.songs
    .map((song) => {
      const file = getFile(song);
      return `
        <article class="song-card" data-song-id="${song.id}">
          <div class="song-card-body">
            <div class="song-title-row">
              <span class="song-number">${song.order}.</span>
              <div class="title-key-grid">
                <label class="field-block title-field">
                  <input data-field="title" value="${escapeHtml(song.title)}" aria-label="곡명" placeholder="찬양 이름을 입력해주세요" />
                </label>
                <div class="key-select-row">
                  <label class="field-block key-field">
                    <select data-field="key" aria-label="Key">
                      ${keyOptions.map((key) => `<option value="${escapeHtml(key)}" ${song.key === key ? "selected" : ""}>${key || "Key"}</option>`).join("")}
                    </select>
                  </label>
                  <label class="field-block key-field modulation-key-field">
                    <select data-field="modulationKey" aria-label="전조 Key">
                      ${keyOptions.map((key) => `<option value="${escapeHtml(key)}" ${song.modulationKey === key ? "selected" : ""}>${key || "전조"}</option>`).join("")}
                    </select>
                  </label>
                </div>
              </div>
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

function getSongMarkers(song) {
  return Array.isArray(song.markers) ? song.markers : [];
}

function getMarkerSize(marker) {
  return Math.max(0.7, Math.min(2.4, Number(marker?.size || 1)));
}

function renderMarkerControls(song) {
  return `
    <div class="marker-toolbar slot-marker-toolbar" data-song-id="${song.id}" aria-label="악보 마커">
      ${markerOptions
        .map(
          (label) =>
            `<button data-action="marker-select" data-label="${escapeHtml(label)}" class="marker-tool" type="button">${escapeHtml(label)}</button>`,
        )
        .join("")}
      <button data-action="markers-clear" class="marker-tool marker-clear" type="button">삭제</button>
    </div>
  `;
}

function renderMarkers(song) {
  return getSongMarkers(song)
    .map(
      (marker) => `
        <div
          class="sheet-marker"
          data-action="marker-drag"
          data-marker-id="${escapeHtml(marker.id)}"
          role="button"
          tabindex="0"
          style="left: ${Number(marker.x || 0) * 100}%; top: ${Number(marker.y || 0) * 100}%; --marker-size: ${getMarkerSize(marker)}"
          aria-label="${escapeHtml(marker.label)} 마커 이동"
        >
          <span class="sheet-marker-label">${escapeHtml(marker.label)}</span>
          <button class="sheet-marker-delete" data-action="marker-delete" data-marker-id="${escapeHtml(marker.id)}" type="button" aria-label="${escapeHtml(marker.label)} 마커 삭제">×</button>
          <span class="sheet-marker-resize" data-action="marker-resize" aria-hidden="true"></span>
        </div>
      `,
    )
    .join("");
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

  els.fileNameHint.textContent = getPdfFileName();
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
    ctx.font = `800 ${20 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    const lineHeight = 26 * scale;
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
  drawSheetMarkers(ctx, song, frame, scale);

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
    ctx.font = `800 ${20 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textBaseline = "top";
    drawWrappedText(ctx, song.flow, rect.x + 10 * scale, flowY + 8 * scale, rect.width - 20 * scale, 26 * scale, Math.max(1, Math.floor((flowHeight - 16 * scale) / (26 * scale))));
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

function drawSheetMarkers(ctx, song, frame, scale) {
  getSongMarkers(song).forEach((marker) => {
    const x = frame.x + frame.width * Number(marker.x || 0);
    const y = frame.y + frame.height * Number(marker.y || 0);
    const markerSize = getMarkerSize(marker);
    const fontSize = 14 * markerSize * scale;
    const paddingX = 6 * markerSize * scale;
    const paddingY = 4 * markerSize * scale;
    const radius = 5 * markerSize * scale;
    const label = String(marker.label || "");
    if (!label) return;

    ctx.save();
    ctx.font = `900 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const textWidth = ctx.measureText(label).width;
    const width = textWidth + paddingX * 2;
    const height = fontSize + paddingY * 2;
    const left = x - width / 2;
    const top = y - height / 2;

    drawRoundRect(ctx, left, top, width, height, radius);
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.fill();
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = Math.max(1, 1.3 * scale);
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.fillText(label, x, y + 0.5 * scale);
    ctx.restore();
  });
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
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

function printWithSetlistTitle() {
  const originalTitle = document.title;
  document.title = getCleanSetlistTitle();
  const restoreTitle = () => {
    document.title = originalTitle;
    window.removeEventListener("afterprint", restoreTitle);
  };
  window.addEventListener("afterprint", restoreTitle);
  window.print();
}

function renderSlot(song) {
  const file = getFile(song);
  const hasFlow = state.layout.showMeta && Boolean(song.flow);
  return `
    <section class="sheet-slot ${hasFlow ? "has-flow" : ""}">
      <div class="slot-meta ${state.layout.showMeta ? "" : "marker-only"}">
        ${state.layout.showMeta ? `<strong>${escapeHtml(getSongLabel(song))}</strong>` : '<span class="slot-marker-label">마커</span>'}
        ${renderMarkerControls(song)}
      </div>
      <div class="slot-body">
        <div class="sheet-frame" data-action="marker-place" data-song-id="${song.id}">
          ${getFileSource(file) ? `<img src="${escapeHtml(getFileSource(file))}" alt="${escapeHtml(song.title)} 악보" />` : '<div class="fallback-sheet" aria-label="악보 자리"></div>'}
          <div class="sheet-marker-layer">${renderMarkers(song)}</div>
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

function clampMarkerValue(value) {
  return Math.max(0.02, Math.min(0.98, value));
}

function addMarker(song, label, x, y) {
  song.markers = getSongMarkers(song);
  song.markers.push({
    id: createId(),
    label,
    x: clampMarkerValue(x),
    y: clampMarkerValue(y),
    size: 1,
  });
  render();
}

function removeMarker(song, markerId) {
  song.markers = getSongMarkers(song).filter((marker) => marker.id !== markerId);
  render();
}

function clearMarkers(song) {
  song.markers = [];
  render();
}

function moveMarker(song, markerId, x, y) {
  const marker = getSongMarkers(song).find((entry) => entry.id === markerId);
  if (!marker) return null;
  marker.x = clampMarkerValue(x);
  marker.y = clampMarkerValue(y);
  return marker;
}

function resizeMarker(song, markerId, size) {
  const marker = getSongMarkers(song).find((entry) => entry.id === markerId);
  if (!marker) return null;
  marker.size = Math.max(0.7, Math.min(2.4, size));
  return marker;
}

async function handleFileList(fileList, songId = "") {
  for (const file of [...fileList]) {
    const item = {
      id: createId(),
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
    applySingleSongLayout();
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
    if (state.layout.songsPerPage === 1) state.layout.orientation = "portrait";
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
    printWithSetlistTitle();
  });
  document.querySelector("#jpgButton").addEventListener("click", () => {
    downloadJpgPages();
  });

  document.body.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-action='marker-delete']");
    if (deleteButton) {
      const frame = deleteButton.closest("[data-action='marker-place']");
      const song = state.songs.find((entry) => entry.id === frame?.dataset.songId);
      if (!song) return;
      removeMarker(song, deleteButton.dataset.markerId);
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const markerButton = event.target.closest("[data-action='marker-select']");
    if (markerButton) {
      const markerHost = markerButton.closest("[data-song-id]");
      if (!markerHost) return;
      const song = state.songs.find((entry) => entry.id === markerHost.dataset.songId);
      if (!song) return;
      const markerCount = getSongMarkers(song).length;
      const offset = ((markerCount % 5) - 2) * 0.035;
      addMarker(song, markerButton.dataset.label || "", 0.5 + offset, 0.45 + offset);
      return;
    }

    const clearButton = event.target.closest("[data-action='markers-clear']");
    if (clearButton) {
      const markerHost = clearButton.closest("[data-song-id]");
      const song = state.songs.find((entry) => entry.id === markerHost?.dataset.songId);
      if (!song) return;
      clearMarkers(song);
      return;
    }
  });

  document.body.addEventListener("dblclick", (event) => {
    const marker = event.target.closest("[data-action='marker-drag']");
    if (!marker) return;
    const frame = marker.closest("[data-action='marker-place']");
    const song = state.songs.find((entry) => entry.id === frame?.dataset.songId);
    if (!song) return;
    removeMarker(song, marker.dataset.markerId);
    event.preventDefault();
  });

  document.body.addEventListener("pointerdown", (event) => {
    const resizeHandle = event.target.closest("[data-action='marker-resize']");
    if (resizeHandle) {
      const marker = resizeHandle.closest("[data-action='marker-drag']");
      const frame = marker?.closest("[data-action='marker-place']");
      const song = state.songs.find((entry) => entry.id === frame?.dataset.songId);
      const markerData = getSongMarkers(song || {}).find((entry) => entry.id === marker?.dataset.markerId);
      if (!marker || !frame || !song || !markerData) return;
      draggingMarker = {
        songId: frame.dataset.songId,
        markerId: marker.dataset.markerId,
        frame,
        marker,
        pointerId: event.pointerId,
        mode: "resize",
        startX: event.clientX,
        startY: event.clientY,
        startSize: getMarkerSize(markerData),
      };
      marker.setPointerCapture?.(event.pointerId);
      marker.classList.add("resizing");
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const marker = event.target.closest("[data-action='marker-drag']");
    if (!marker) return;
    if (event.target.closest("[data-action='marker-delete']")) return;
    const frame = marker.closest("[data-action='marker-place']");
    if (!frame) return;
    draggingMarker = {
      songId: frame.dataset.songId,
      markerId: marker.dataset.markerId,
      frame,
      marker,
      pointerId: event.pointerId,
      mode: "move",
      startX: event.clientX,
      startY: event.clientY,
      startSize: 1,
    };
    marker.setPointerCapture?.(event.pointerId);
    marker.classList.add("dragging");
    event.preventDefault();
  });

  document.body.addEventListener("pointermove", (event) => {
    if (!draggingMarker.marker || event.pointerId !== draggingMarker.pointerId) return;
    const song = state.songs.find((entry) => entry.id === draggingMarker.songId);
    if (!song) return;
    const rect = draggingMarker.frame.getBoundingClientRect();
    if (draggingMarker.mode === "resize") {
      const delta = Math.max(event.clientX - draggingMarker.startX, event.clientY - draggingMarker.startY);
      const marker = resizeMarker(song, draggingMarker.markerId, draggingMarker.startSize + delta / 72);
      if (!marker) return;
      draggingMarker.marker.style.setProperty("--marker-size", String(getMarkerSize(marker)));
      event.preventDefault();
      return;
    }
    const marker = moveMarker(song, draggingMarker.markerId, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    if (!marker) return;
    draggingMarker.marker.style.left = `${marker.x * 100}%`;
    draggingMarker.marker.style.top = `${marker.y * 100}%`;
    event.preventDefault();
  });

  document.body.addEventListener("pointerup", (event) => {
    if (!draggingMarker.marker || event.pointerId !== draggingMarker.pointerId) return;
    draggingMarker.marker.classList.remove("dragging");
    draggingMarker.marker.classList.remove("resizing");
    saveSnapshot();
    draggingMarker = {
      songId: "",
      markerId: "",
      frame: null,
      marker: null,
      pointerId: 0,
      mode: "",
      startX: 0,
      startY: 0,
      startSize: 1,
    };
  });

  document.body.addEventListener("pointercancel", () => {
    if (draggingMarker.marker) draggingMarker.marker.classList.remove("dragging");
    if (draggingMarker.marker) draggingMarker.marker.classList.remove("resizing");
    draggingMarker = {
      songId: "",
      markerId: "",
      frame: null,
      marker: null,
      pointerId: 0,
      mode: "",
      startX: 0,
      startY: 0,
      startSize: 1,
    };
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
        song.modulationKey = findRememberedModulationKey(song.title);
        shouldRenderSongs = true;
      }
    }
    if ((event.target.dataset.field === "title" || event.target.dataset.field === "key" || event.target.dataset.field === "modulationKey") && song.title && song.key) {
      rememberSongKey(song.title, song.key, song.modulationKey);
    }
    if (shouldRenderSongs) renderSongs();
    renderPreview();
    saveSnapshot();
  });

  document.body.addEventListener("change", async (event) => {
    const card = event.target.closest("[data-song-id]");
    if (!card) return;
    const song = state.songs.find((entry) => entry.id === card.dataset.songId);
    if (!song) return;

    if (event.target.dataset.field) {
      song[event.target.dataset.field] = event.target.value;
      if (song.title && song.key) rememberSongKey(song.title, song.key, song.modulationKey);
      render();
      return;
    }

    if (event.target.dataset.action === "single-upload") {
      await handleFileList(event.target.files, song.id);
      event.target.value = "";
      return;
    }
  });

}

function boot() {
  notifyVisit();
  loadSnapshot();
  ensureSongCount(state.setlist.songCount);
  applySingleSongLayout();
  bindEvents();
  render();
  restoreStoredFileObjectUrls()
    .then((didRestore) => {
      if (didRestore) render();
    })
    .catch(() => {});
}

boot();
