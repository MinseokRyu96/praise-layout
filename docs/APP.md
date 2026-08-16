# App Framework Plan

## Decision

Use Capacitor as the native app wrapper, targeting **iPadOS only** for v1.

The project is already a static web app with `package.json`, `npm run build`, and `dist/index.html`, so Capacitor wraps that same `dist/` output without rewriting the editor. The desktop editor layout (two-pane workspace, A3 preview) is the one the iPad shows, which is why iPad is the target rather than iPhone.

## Folder Strategy

One source of truth, no separate `app/` folder:

- Web source: root HTML/CSS/JS files
- Web build output: `dist/`
- App config: `capacitor.config.json`
- Native project: `ios/`

Vercel web deployment and the app build use the same UI code.

## Generated vs. tracked

`ios/App/App/public/`, `ios/App/App/capacitor.config.json`, and `ios/capacitor-cordova-ios-plugins/` are produced by `cap sync` and are gitignored. After a fresh clone, run `npm run app:sync` before opening Xcode — otherwise the app launches to a blank WebView.

## Commands

```bash
npm install
npm run app:sync        # build web + copy into ios/
npm run app:open:ios    # open Xcode
npm run app:run:ios     # build + run on a simulator/device
npm run app:build:ios   # release build against the iOS Simulator SDK (CI-friendly check)
```

## Ads

AdSense must never load inside the native WebView — it violates AdSense policy. Every page gates the script on `window.location.hostname === "praise-layout.vercel.app"`, so it is inert in the app. If ads are ever wanted in the app, use AdMob (`@capacitor-community/admob`), not AdSense, and update `PrivacyInfo.xcprivacy` and the App Store privacy answers.

## Next Native Work

- Replace the default white Capacitor splash with a branded one.
- Test file upload, IndexedDB persistence, PDF print, and JPG download on a real iPad.
- Consider `@capacitor/share` / `@capacitor/filesystem` if WebView PDF/JPG saving proves limited.
