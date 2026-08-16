# iPadOS Release Prep

## App Store Fields

| Field | Value |
| --- | --- |
| Name | `콘티노트` |
| Subtitle | `찬양팀 악보 콘티 제작` |
| Bundle ID | `com.praiselayout.app` |
| SKU | `praise-layout-ios` |
| Primary Category | Productivity |
| Secondary Category | Music |
| Privacy Policy URL | `https://praise-layout.vercel.app/privacy` |
| Support URL | `https://praise-layout.vercel.app/contact` |

Name rationale: short enough for the iPad Home Screen and broad enough to grow past the current MVP. Put search intent in the subtitle and keywords, not the name.

## Description Draft

`콘티노트`는 찬양팀이 예배 콘티와 악보를 빠르게 정리할 수 있도록 만든 iPad 콘티 제작 도구입니다. 예배 날짜와 콘티명, 찬양 이름, Key와 전조 Key, 흐름 메모를 입력하고 업로드한 악보 위에 V, Ch, P.C, Br 같은 섹션 마커를 직접 배치할 수 있습니다.

A3 PDF 저장과 페이지별 JPG 저장을 지원해 리허설 공유, 출력, 모바일 확인에 사용할 수 있습니다.

## Keywords Draft

`찬양콘티,예배콘티,찬양팀,악보정리,A3악보,PDF,JPG,예배준비,콘티`

## Privacy Policy for the Native Build

- No account sign-in, no analytics SDK, no advertising SDK, no tracking.
- Uploads stay in device WebView storage unless the user exports PDF/JPG.
- AdSense loads only on the public web host; the native build never loads it.

`PrivacyInfo.xcprivacy` declares no tracking, no collected data types, and no accessed API types. If analytics, crash reporting, cloud sync, or ads are added later, update that file **and** the App Store Connect privacy answers together.

## Current Native Settings

| Item | Value |
| --- | --- |
| Platform | Capacitor 8 iOS wrapper (SPM) |
| App ID | `com.praiselayout.app` |
| Display name | `콘티노트` |
| Development region | `ko` |
| iOS deployment target | 15.0 |
| Device family | iPad only (`TARGETED_DEVICE_FAMILY = "2"`) |
| Orientations | all four (Split View / Slide Over supported) |
| Required capabilities | `arm64` |
| Encryption | `ITSAppUsesNonExemptEncryption = false` |
| Version / Build | 1.0 / 1 |
| Team | `77WL78RTS8` (Minseok Ryu) |
| Release signing | Manual — `iPhone Distribution`, profile `Conti Note App Store` |

Debug stays on automatic signing so simulator builds need no credentials; only Release
against `sdk=iphoneos*` is pinned to the distribution certificate and profile.

## Signing

No Apple ID is attached to this machine's Xcode. Signing uses the account's single
distribution certificate, which was originally created by EAS for the other app on this
account; the profile below was issued through the App Store Connect API.

- Distribution certificate lives in the login keychain (`security find-identity -v -p codesigning`).
  Its private key is also held by EAS, so it can be re-downloaded with `eas credentials`.
- Profile `Conti Note App Store` (`79387ffb-36fe-4af4-9e04-22546f3121a4`) is installed under
  `~/Library/MobileDevice/Provisioning Profiles/`.
- Certificate expires **2027-08-09**. Apple caps distribution certificates at a small number,
  so reuse this one rather than issuing another; renewing means a new certificate plus a new
  profile, and the profile name in the build settings can stay the same.

A machine without those two artifacts cannot produce a Release device build. Either import
the `.p12` backup and the profile, or sign in to Xcode and switch Release back to automatic.


## Remaining Manual Steps

1. Capture iPad screenshots (13" and 11" required sizes) from the latest build.
2. Fill App Privacy and export compliance answers.
3. Test through TestFlight before submitting for review.

The App Store Connect record already exists (`콘티노트`, SKU `20260816-01`), and the archive,
export, and upload steps are scripted — see the verification checklist below.

App Review rejects thin website wrappers, so the listing and screenshots should lead with offline editing, local file persistence, on-sheet markers, and A3 PDF/JPG export.

## Verification Checklist

```bash
npm run build
npm run app:sync
plutil -lint ios/App/App/Info.plist ios/App/App/PrivacyInfo.xcprivacy
npm run app:build:ios                     # simulator SDK, no signing needed
security find-identity -v -p codesigning  # must list the distribution identity
```

Release device build, archive, export, and validation:

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath build/ContiNote.xcarchive archive
xcodebuild -exportArchive -archivePath build/ContiNote.xcarchive \
  -exportOptionsPlist build/ExportOptions.plist -exportPath build/export
API_PRIVATE_KEYS_DIR=<dir holding AuthKey_*.p8> \
  xcrun altool --validate-app -f build/export/App.ipa -t ios \
  --apiKey <key id> --apiIssuer <issuer id>
```

Swap `--validate-app` for `--upload-app` to send the build to TestFlight. The App Store
Connect API key is a team-wide credential — keep it out of the repo.
