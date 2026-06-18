function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return "";
}

function truncate(value, maxLength) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function buildDiscordMessage(req, body) {
  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const referer = req.headers.referer || req.headers.referrer || "direct";
  const userAgent = req.headers["user-agent"] || "unknown";
  const country = req.headers["x-vercel-ip-country"] || "";
  const region = req.headers["x-vercel-ip-country-region"] || "";
  const city = req.headers["x-vercel-ip-city"] || "";
  const path = body?.path || "/";
  const title = body?.title || "PraiseLayout";
  const source = [city, region, country].filter(Boolean).join(", ") || "unknown";
  const ip = getClientIp(req);

  return {
    username: "PraiseLayout",
    embeds: [
      {
        title: "새 방문자 접속",
        color: 1013358,
        fields: [
          { name: "페이지", value: truncate(path, 300), inline: false },
          { name: "제목", value: truncate(title, 120), inline: false },
          { name: "시간", value: now, inline: true },
          { name: "위치", value: truncate(source, 120), inline: true },
          { name: "Referrer", value: truncate(referer, 300), inline: false },
          { name: "User Agent", value: truncate(userAgent, 500), inline: false },
        ],
        footer: {
          text: ip ? `IP 일부: ${ip.split(".").slice(0, 2).join(".")}.*.*` : "IP 미포함",
        },
      },
    ],
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false });
    return;
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    res.status(204).end();
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildDiscordMessage(req, req.body || {})),
    });

    if (!response.ok) {
      res.status(502).json({ ok: false });
      return;
    }

    res.status(204).end();
  } catch {
    res.status(500).json({ ok: false });
  }
};
