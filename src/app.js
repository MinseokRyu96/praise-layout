const storageKey = "praise-layout-mvp-v10";

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
    migratePlaceholderDefaults();
  } catch {
    localStorage.removeItem(storageKey);
  }
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
              <label class="field-block title-field">
                <span>곡명</span>
                <input data-field="title" value="${escapeHtml(song.title)}" placeholder="예: ${escapeHtml(sampleTitles[song.order - 1] || "곡명")}" />
              </label>
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
  if (file.objectUrl) return `<img src="${file.objectUrl}" alt="${escapeHtml(file.name)} 미리보기" />`;
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
    const canvases = [];
    for (let index = 0; index < pages.length; index += 1) {
      canvases.push(await renderJpgCanvas(pages[index]));
    }
    const exportCanvas = combineJpgCanvases(canvases);
    const blob = await canvasToJpgBlob(exportCanvas);
    downloadBlob(blob, `${getCleanBaseName()}.jpg`);
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

function combineJpgCanvases(canvases) {
  if (canvases.length === 1) return canvases[0];

  const gap = 36;
  const sourceWidth = canvases[0].width;
  const sourceHeight = canvases.reduce((sum, canvas) => sum + canvas.height, 0) + gap * (canvases.length - 1);
  const maxHeight = 8192;
  const scale = Math.min(1, maxHeight / sourceHeight);
  const output = document.createElement("canvas");
  output.width = Math.round(sourceWidth * scale);
  output.height = Math.round(sourceHeight * scale);

  const ctx = output.getContext("2d");
  ctx.fillStyle = "#f6f8fb";
  ctx.fillRect(0, 0, output.width, output.height);

  let y = 0;
  canvases.forEach((canvas) => {
    const width = Math.round(canvas.width * scale);
    const height = Math.round(canvas.height * scale);
    ctx.drawImage(canvas, 0, y, width, height);
    ctx.strokeStyle = "#d6dde8";
    ctx.lineWidth = Math.max(1, Math.round(scale));
    ctx.strokeRect(0.5, y + 0.5, width - 1, height - 1);
    y += height + Math.round(gap * scale);
  });

  return output;
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
    drawClampedLine(ctx, `${song.order}. ${song.title || "곡명 없음"}`, rect.x + 9 * scale, rect.y + metaHeight / 2, rect.width - 18 * scale);
    contentY += metaHeight;
    contentHeight -= metaHeight;
  }

  const hasFlow = state.layout.showMeta && Boolean(song.flow);
  let flowHeight = 0;
  if (hasFlow) {
    const flowPadding = 8 * scale;
    ctx.font = `800 ${12 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    const lineHeight = 16 * scale;
    const flowLines = getWrappedLines(ctx, song.flow, rect.width - flowPadding * 2, 4);
    flowHeight = Math.min(rect.height * 0.28, flowLines.length * lineHeight + flowPadding * 2);
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
    ctx.font = `800 ${12 * scale}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textBaseline = "top";
    drawWrappedText(ctx, song.flow, rect.x + 8 * scale, flowY + 6 * scale, rect.width - 16 * scale, 16 * scale, Math.max(1, Math.floor((flowHeight - 12 * scale) / (16 * scale))));
  }

  ctx.restore();
}

async function drawSheetImage(ctx, song, frame, scale) {
  const file = getFile(song);
  if (file?.objectUrl && file.type !== "application/pdf") {
    const image = await loadImage(file.objectUrl);
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
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight, maxWidth);
  });
}

function getWrappedLines(ctx, text, maxWidth, maxLines = 99) {
  const lines = [];
  const paragraphs = String(text || "").split(/\n/);

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      return;
    }

    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth || !line) {
        line = next;
      } else {
        lines.push(line);
        line = word;
      }
    });
    lines.push(line);
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
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  document.querySelector("#jpgButton").addEventListener("click", () => {
    downloadJpgPages();
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
