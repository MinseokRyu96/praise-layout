const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

const entries = [
  "index.html",
  "styles.css",
  "src",
];

function copyEntry(source, target) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const child of fs.readdirSync(source)) {
      copyEntry(path.join(source, child), path.join(target, child));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of entries) {
  copyEntry(path.join(root, entry), path.join(dist, entry));
}

console.log("Built static app to dist/");
