const fs = require("node:fs");
const path = require("node:path");
const { marked } = require("marked");

const root = path.join(__dirname, "..");
const postsDir = path.join(root, "content", "blog");
const outDir = path.join(root, "blog");
const siteUrl = "https://praise-layout.vercel.app";
const styleVersion = "71";

// Front matter is a flat "key: value" block; no nested YAML is used or supported.
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("missing front matter");

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(":");
    if (separator === -1) throw new Error(`bad front matter line: ${line}`);
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body: match[2] };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function readingMinutes(body) {
  // Korean prose runs roughly 500 characters a minute.
  const text = body.replace(/[#>*_`\-\[\]()!]/g, "").replace(/\s+/g, "");
  return Math.max(1, Math.round(text.length / 500));
}

function loadPosts() {
  if (!fs.existsSync(postsDir)) return [];

  const posts = fs
    .readdirSync(postsDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const slug = name.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(postsDir, name), "utf8");
      let parsed;
      try {
        parsed = parseFrontMatter(raw);
      } catch (error) {
        throw new Error(`${name}: ${error.message}`);
      }

      for (const field of ["title", "description", "date"]) {
        if (!parsed.data[field]) throw new Error(`${name}: front matter is missing "${field}"`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.data.date)) {
        throw new Error(`${name}: date must be YYYY-MM-DD`);
      }
      if (parsed.data.draft === "true") return null;

      return {
        slug,
        title: parsed.data.title,
        description: parsed.data.description,
        date: parsed.data.date,
        updated: parsed.data.updated || parsed.data.date,
        tag: parsed.data.tag || "찬양팀 가이드",
        body: parsed.data.body || parsed.body,
        html: marked.parse(parsed.body),
        minutes: readingMinutes(parsed.body),
        url: `${siteUrl}/blog/${slug}`,
      };
    })
    .filter(Boolean);

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  return posts;
}

// Matches the markup the other content pages use so the blog inherits the same
// styling instead of introducing a second look.
function layout({ title, description, canonical, eyebrow, heading, lead, main, jsonLd, meta = "" }) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="PraiseLayout" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="theme-color" content="#0f766e" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
    <script>
      (() => {
        const adSenseHosts = new Set(["praise-layout.vercel.app"]);
        if (!adSenseHosts.has(window.location.hostname)) return;

        const adScript = document.createElement("script");
        adScript.async = true;
        adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8104838143348148";
        adScript.crossOrigin = "anonymous";
        document.head.appendChild(adScript);
      })();
    </script>
    <script type="application/ld+json">
${jsonLd}
    </script>
    <link rel="stylesheet" href="/styles.css?v=${styleVersion}" />
  </head>
  <body class="content-page">
    <header class="site-header">
      <a class="brand" href="/" aria-label="PraiseLayout home">
        <span class="brand-mark">PL</span>
        <span>
          <strong>PraiseLayout</strong>
          <small>A3 worship sheet maker</small>
        </span>
      </a>
      <nav class="site-nav" aria-label="사이트 메뉴">
        <a href="/">도구 열기</a>
        <a href="/blog">찬양팀 가이드</a>
        <a href="/guide">사용 가이드</a>
        <a href="/about">서비스 소개</a>
      </nav>
    </header>

    <main class="content-shell">
      <section class="content-hero">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(heading)}</h1>
        <p class="lead">${escapeHtml(lead)}</p>
        ${meta}
      </section>

${main}
    </main>

    <footer class="site-footer">
      <p>찬양팀 콘티 제작기: 예배 콘티, A3 악보 정리, PDF/JPG 다운로드, 섹션 마커 표시를 지원합니다.</p>
      <nav class="footer-links" aria-label="사이트 정보">
        <a href="/about">서비스 소개</a>
        <a href="/guide">사용 가이드</a>
        <a href="/blog">찬양팀 가이드</a>
        <a href="/privacy">개인정보처리방침</a>
        <a href="/terms">이용약관</a>
        <a href="/contact">문의</a>
      </nav>
    </footer>
  </body>
</html>
`;
}

function renderList(posts) {
  const items = posts
    .map(
      (post) => `        <li class="post-card">
          <a class="post-card-link" href="/blog/${post.slug}">
            <p class="post-card-meta"><span class="post-tag">${escapeHtml(post.tag)}</span><time datetime="${post.date}">${formatDate(post.date)}</time><span>읽는 데 약 ${post.minutes}분</span></p>
            <h2>${escapeHtml(post.title)}</h2>
            <p>${escapeHtml(post.description)}</p>
            <span class="post-card-more">이어서 읽기</span>
          </a>
        </li>`,
    )
    .join("\n");

  const main = `      <section class="content-section">
        <ul class="post-list">
${items}
        </ul>
      </section>`;

  const jsonLd = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "찬양팀 가이드",
      description: "찬양 콘티, Key 선정, 리허설 준비 등 예배팀 실무에 필요한 내용을 정리합니다.",
      url: `${siteUrl}/blog`,
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated,
        url: post.url,
      })),
    },
    null,
    2,
  );

  return layout({
    title: "찬양팀 가이드 | PraiseLayout",
    description:
      "찬양 콘티 짜는 법, 회중 음역대에 맞는 Key 선정, 리허설 준비까지 예배팀이 실제로 쓰는 내용을 정리한 글 모음입니다.",
    canonical: `${siteUrl}/blog`,
    eyebrow: "Blog",
    heading: "찬양팀 가이드",
    lead: "콘티 구성, Key 선정, 리허설 진행처럼 예배팀이 매주 부딪히는 문제를 정리합니다. 도구 사용법은 사용 가이드에서 따로 다룹니다.",
    main,
    jsonLd,
  });
}

function renderPost(post, posts) {
  const others = posts.filter((entry) => entry.slug !== post.slug).slice(0, 3);
  const related = others.length
    ? `      <section class="content-section">
        <h2>함께 읽으면 좋은 글</h2>
        <ul class="content-list">
${others.map((entry) => `          <li><a href="/blog/${entry.slug}">${escapeHtml(entry.title)}</a></li>`).join("\n")}
        </ul>
      </section>`
    : "";

  const main = `      <article class="content-section post-body">
${post.html.trimEnd()}
      </article>

${related}

      <section class="content-section post-cta">
        <h2>콘티를 파일로 정리해 보세요</h2>
        <p>
          PraiseLayout은 곡 순서와 Key, 흐름 메모, 악보 위 섹션 마커를 A3 PDF와 JPG로 정리하는 무료 웹 도구입니다.
          설치 없이 브라우저에서 바로 쓸 수 있습니다.
        </p>
        <p><a class="post-cta-link" href="/">콘티 제작기 열기</a></p>
      </section>`;

  const jsonLd = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated,
      inLanguage: "ko",
      mainEntityOfPage: { "@type": "WebPage", "@id": post.url },
      url: post.url,
      publisher: { "@type": "Organization", name: "PraiseLayout", url: siteUrl },
    },
    null,
    2,
  );

  const meta = `<p class="post-meta"><span class="post-tag">${escapeHtml(post.tag)}</span><time datetime="${post.date}">${formatDate(post.date)}</time><span>읽는 데 약 ${post.minutes}분</span></p>`;

  return layout({
    title: `${post.title} | PraiseLayout`,
    description: post.description,
    canonical: post.url,
    eyebrow: "찬양팀 가이드",
    heading: post.title,
    lead: post.description,
    main,
    jsonLd,
    meta,
  });
}

function writeBlog() {
  const posts = loadPosts();

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), renderList(posts));
  for (const post of posts) {
    fs.writeFileSync(path.join(outDir, `${post.slug}.html`), renderPost(post, posts));
  }

  return posts;
}

function writeSitemap(posts) {
  const staticPages = ["/", "/about", "/guide", "/blog", "/privacy", "/terms", "/contact"];
  const newestPost = posts[0]?.updated;
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    ...staticPages.map((page) => ({
      loc: `${siteUrl}${page === "/" ? "/" : page}`,
      lastmod: page === "/blog" ? newestPost || today : today,
    })),
    ...posts.map((post) => ({ loc: post.url, lastmod: post.updated })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n  </url>`)
  .join("\n")}
</urlset>
`;

  fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
}

module.exports = { writeBlog, writeSitemap, loadPosts };

if (require.main === module) {
  const posts = writeBlog();
  writeSitemap(posts);
  console.log(`blog: ${posts.length} post(s) -> blog/, sitemap.xml updated`);
}
