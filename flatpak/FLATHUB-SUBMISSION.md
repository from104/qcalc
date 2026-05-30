# Flathub 제출 가이드 (QCalc)

QCalc를 Flathub에 제출하기 위한 사전 작업, 매니페스트 재구성, 로컬 검증, 제출 PR 절차, 머지 후 운영을 정리한 단일 참조 문서. 작성일 2026-05-30, 대상 버전 v0.12.0 이후.

> **현재 상태 한 줄 요약**: `flatpak/io.github.from104.qcalc.yml`의 `type: dir` + 사전 빌드 `linux-unpacked` 패턴은 Flathub에 **절대 제출 불가**. 매니페스트 전면 재구성(in-sandbox build + Yarn 4 Berry 의존성 벤더링) 후 제출 가능. metainfo/desktop은 이 PR로 보강 완료.

---

## 1. 개요

| 항목             | 값                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| App ID           | `io.github.from104.qcalc`                                                                            |
| 도메인 소유 증명 | GitHub Pages (`https://from104.github.io`) 필요                                                      |
| Runtime          | `org.freedesktop.Platform//25.08` (현재 최신; 매 제출 시 최신 재확인)                                |
| SDK              | `org.freedesktop.Sdk//25.08`                                                                         |
| BaseApp          | `org.electronjs.Electron2.BaseApp//25.08`                                                            |
| SDK Extension    | `org.freedesktop.Sdk.Extension.node22` (Yarn/Node 빌드용)                                            |
| Build 모델       | **In-sandbox build** (yarn install → quasar build) — 의존성은 `flatpak-node-generator`로 사전 벤더링 |
| 라이선스         | MIT (project), CC0-1.0 (metainfo)                                                                    |
| 제출 PR 대상     | `flathub/flathub` 리포의 **`new-pr`** 브랜치 (master 아님)                                           |

본 문서가 다루는 범위: Flathub 제출에 필요한 모든 사전 작업 + 제출 절차 + 머지 후 운영. 다루지 않는 범위: Electron .deb/.AppImage/.rpm 빌드(electron-builder 별도 파이프라인).

---

## 2. Flathub 제출 모델 이해 — 가장 중요한 mindset shift

Flathub는 제출된 매니페스트를 자체 인프라(no network)에서 다시 빌드해 서명/배포한다. 이 정책 두 가지가 절대 룰이다:

1. **flatpak-builder 단계에서 네트워크 차단** (`docs.flathub.org/docs/for-app-authors/requirements` 명시). 빌드 중 `yarn install`, `npm fetch`, `git clone` 등 어떤 네트워크 호출도 불가.
2. **빌드 산출물 제출 금지**: "Under no circumstances should source code nor build artifacts be included in the submission." 즉 현재 QCalc의 `linux-unpacked` 디렉터리를 `type: dir`로 넘기는 패턴은 **exception never granted** 룰 위반.

> 둘 다 `flatpak-builder-lint`의 `manifest-toplevel-build-network-access` / `module-*-build-network-access` 룰로 자동 차단되며, Flathub 문서가 이 예외는 "never granted"라 못박았다.

**결론**: 모든 의존성을 사전에 체크섬 핀된 `sources:` 엔트리로 선언해 사후 오프라인 빌드가 가능해야 한다. Electron 앱은 거의 모두 [`flatpak-node-generator`](https://github.com/flatpak/flatpak-builder-tools/tree/master/node)로 npm/yarn 의존성을 `generated-sources.json`으로 변환해 제출한다.

**Reference apps** (모두 in-sandbox + yarn vendoring 패턴):

- [Joplin](https://github.com/flathub/net.cozic.joplin_desktop) — Yarn Berry 사용 사례
- [Logseq](https://github.com/flathub/com.logseq.Logseq)
- [Standard Notes](https://github.com/flathub/org.standardnotes.standardnotes)
- [electron-sample-app](https://github.com/flathub/com.github.flathub.electron-sample-app) — 공식 레퍼런스

이 4개 매니페스트를 먼저 정독하면 90% 답이 나온다.

---

## 3. App ID와 도메인 검증

`io.github.from104.qcalc`는 RDNN 룰(3~5 컴포넌트, `[A-Za-z0-9_]`, 소문자 도메인, 닷 suffix 금지)에 부합한다. 그러나 **`from104.github.io` 페이지가 실제 접근 가능**해야 도메인 소유로 인정된다.

**필수 사전 작업** (운영자):

1. GitHub에 `from104.github.io` 리포 생성 (또는 `from104`의 어떤 리포든 Pages 활성화 후 user site로 노출)
2. 최소 `index.html` 한 줄이라도 push해 `https://from104.github.io`가 200 OK 반환하도록
3. 빈 페이지로도 무방. 리뷰어는 도메인 도달만 확인.

ID 변경은 사후 매우 비싸다 (`<provides>` + `<replaces>` + EOL rebase + 재제출). 지금 확정.

---

## 4. 제출 저장소 구조

QCalc는 두 개 git 리포를 별도로 운영하게 된다:

| 리포          | 위치                                                             | 역할                                                   |
| ------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| **본 리포**   | `github.com/from104/qcalc`                                       | 앱 소스, dev/로컬 Flatpak 테스트용 `flatpak/` 디렉터리 |
| **제출 리포** | `github.com/flathub/io.github.from104.qcalc` (머지 후 자동 생성) | Flathub용 매니페스트 + 부속 파일만                     |

제출 리포 **root에 들어가는 파일** (모두 평면 배치, 서브디렉터리 금지):

```
io.github.from104.qcalc.yml                # 매니페스트 (이름이 app-id와 일치해야 함)
io.github.from104.qcalc.metainfo.xml       # AppStream
io.github.from104.qcalc.desktop            # XDG desktop entry
io.github.from104.qcalc.png                # 512x512 PNG 또는 .svg
generated-sources.json                      # flatpak-node-generator 출력
flatpak-yarn-berry.js                       # Yarn Berry plugin (체크섬 핀)
flathub.json                                # only-arches, automerge, …
(optional) patches/                         # 필요 시
```

본 리포의 `flatpak/`는 **개발용**으로 유지: 로컬 빌드/테스트, metainfo·desktop 편집의 source of truth. 제출 시 이 파일들을 제출 리포로 복사한다.

---

## 5. Manifest 작성 가이드 (제출용 신규 매니페스트)

아래는 in-sandbox build로 재구성된 매니페스트의 골격. `electron-sample-app` 패턴을 따른다.

```yaml
id: io.github.from104.qcalc
runtime: org.freedesktop.Platform
runtime-version: '25.08'
sdk: org.freedesktop.Sdk
sdk-extensions:
  - org.freedesktop.Sdk.Extension.node22
base: org.electronjs.Electron2.BaseApp
base-version: '25.08'

command: run.sh

separate-locales: false

build-options:
  append-path: /usr/lib/sdk/node22/bin
  env:
    npm_config_nodedir: /usr/lib/sdk/node22
    npm_config_offline: 'true'
    npm_config_cache: /run/build/qcalc/npm-cache
    YARN_GLOBAL_FOLDER: /run/build/qcalc/.yarn/global
    YARN_ENABLE_TELEMETRY: '0'
    ELECTRON_SKIP_BINARY_DOWNLOAD: '1'

finish-args:
  - --socket=wayland
  - --socket=fallback-x11
  - --share=ipc
  - --device=dri
  - --share=network # live currency exchange (정당화: metainfo recommends/internet)
  - --socket=pulseaudio # button click sounds (선택; portal로 대체 가능)
  - --env=ELECTRON_TRASH=gio
  # 파일 export/import는 FileChooser portal 사용 (별도 권한 불필요)

cleanup:
  - /include
  - /lib/pkgconfig
  - /share/man
  - '*.a'
  - '*.la'

modules:
  - name: qcalc
    buildsystem: simple
    sources:
      # 1) 본 앱 소스 (태그 핀)
      - type: archive
        url: https://github.com/from104/qcalc/archive/refs/tags/v0.12.1.tar.gz
        sha256: <TBD-제출-시-계산>
        x-checker-data:
          type: anitya
          project-id: <TBD-anitya-등록-후>
          url-template: https://github.com/from104/qcalc/archive/refs/tags/v$version.tar.gz

      # 2) Yarn Berry 의존성 (offline)
      - generated-sources.json

      # 3) Yarn Berry용 offline plugin
      - type: file
        url: https://github.com/flatpak/flatpak-builder-tools/raw/master/node/flatpak-yarn-berry.js
        sha256: <TBD>
        dest-filename: flatpak-yarn-berry.js

    build-commands:
      # Yarn Berry offline 모드
      - YARN_CACHE_FOLDER="$PWD/.yarn-cache" yarn config set --home enableTelemetry 0
      - yarn plugin import "$PWD/flatpak-yarn-berry.js"
      - YARN_ENABLE_NETWORK=0 yarn install --immutable
      # Electron 앱 빌드 (electron binary 다운로드 차단 + 사전 벤더링된 것 사용)
      - npx quasar build -m electron --publish never
      # 산출물 복사
      - cp -a dist/electron/Packaged/linux-unpacked /app/qcalc
      # 메타데이터 설치
      - install -Dm644 flatpak/io.github.from104.qcalc.desktop /app/share/applications/io.github.from104.qcalc.desktop
      - install -Dm644 flatpak/io.github.from104.qcalc.metainfo.xml /app/share/metainfo/io.github.from104.qcalc.metainfo.xml
      - install -Dm644 flatpak/icons/io.github.from104.qcalc.png /app/share/icons/hicolor/512x512/apps/io.github.from104.qcalc.png
      # run.sh
      - install -Dm755 /dev/stdin /app/bin/run.sh <<<'#!/bin/sh
        exec zypak-wrapper /app/qcalc/qcalc "$@"'
```

핵심 차이점 (현재 매니페스트 대비):

- Runtime 24.08 → 25.08
- `sdk-extensions: node22` 추가 (yarn/node 빌드용)
- `type: dir linux-unpacked` 제거, `type: archive` + `generated-sources.json`으로 대체
- `build-options.env`에 offline 환경변수 + Electron binary 다운로드 차단
- `cleanup` 블록 추가
- `--filesystem=*` 사용하지 않음 (FileChooser portal로 처리)
- 아이콘 설치 경로 `hicolor/256x256` → `hicolor/512x512` (실제 크기 매칭)

---

## 6. Yarn 4 Berry 의존성 벤더링

QCalc는 Yarn 4.10.3 (Berry, PnP가 아닌 node-modules linker)을 쓴다. Flathub의 `flatpak-node-generator`는 npm + 클래식 Yarn 1을 우선 지원하지만, [Yarn Berry용 fork/plugin이 존재한다](https://github.com/flatpak/flatpak-builder-tools/tree/master/node).

### 사전 준비

`.yarnrc.yml`에 명시:

```yaml
nodeLinker: node-modules # PnP 사용 안 함 (Electron + Flatpak 호환성)
enableTelemetry: false
```

(현재 QCalc는 이미 node-modules 사용 중일 가능성 큼 — 확인 필요)

### generated-sources.json 생성

본 리포에서 실행:

```bash
# flatpak-builder-tools 클론
git clone https://github.com/flatpak/flatpak-builder-tools.git /tmp/fbt
cd /home/from104/work/qcalc

# Yarn Berry용 generator 실행
python3 /tmp/fbt/node/flatpak-node-generator.py \
  --type yarn \
  --yarn-berry \
  yarn.lock \
  -o flatpak-submission/generated-sources.json

# flatpak-yarn-berry.js 다운로드 + 체크섬
curl -sL https://github.com/flatpak/flatpak-builder-tools/raw/master/node/flatpak-yarn-berry.js \
  -o flatpak-submission/flatpak-yarn-berry.js
sha256sum flatpak-submission/flatpak-yarn-berry.js
```

`generated-sources.json`은 수백 개의 의존성을 `type: file` 엔트리로 풀어낸 거대 JSON. 매니페스트에 한 줄로 include한다 (`- generated-sources.json`).

### 의존성 업데이트 시

`yarn.lock` 변경 → `flatpak-node-generator` 재실행 → 새 `generated-sources.json` commit. 자동화는 `x-checker-data`(아래 10절) + `automerge-flathubbot-prs`로 처리.

---

## 7. Electron-updater 비활성화

Flatpak 안에서 electron-updater가 동작하면 안 된다 — Flathub가 업데이트를 관리한다. QCalc의 [`src-electron/electron-main.ts`](../src-electron/electron-main.ts)에 이미 `isFlatpak` 감지 변수가 있고(`process.env.FLATPAK_ID` 체크), `isSandboxed = isSnap || isFlatpak`이 정의돼 있다. 다만 모든 `autoUpdater.*` 호출이 `!isSandboxed` 가드로 둘러싸여 있는지 직접 검증해야 한다.

### 검증 절차

```bash
grep -nE 'autoUpdater\.' src-electron/electron-main.ts
# 각 호출 라인이 isSandboxed/isFlatpak 가드 안에 있는지 수동 확인
```

가드 안에 있지 않은 호출은 다음 패턴으로 감쌈:

```typescript
if (!isSandboxed) {
  autoUpdater.checkForUpdates();
  // ...
}
```

### electron-builder 측 보강

`package.json` electron-builder block의 `linux.target`에 Flatpak에 들어가는 빌드는 `publish: never` 보장, 그리고 `app-update.yml`(electron-updater 메타파일)이 Flatpak 빌드에 포함되지 않도록:

```json
"linux": {
  "target": ["AppImage", "deb", "rpm"],
  "publish": null
}
```

혹은 Flatpak 빌드 단계 후 `app-update.yml`을 명시적으로 삭제:

```yaml
# 매니페스트 build-commands 끝부분
- rm -f /app/qcalc/resources/app-update.yml
```

---

## 8. MetaInfo 품질 가이드라인 준수

[`io.github.from104.qcalc.metainfo.xml`](io.github.from104.qcalc.metainfo.xml)은 본 PR로 이미 다음 항목을 보강했다:

- 10개 언어 (8→10) 정정
- `<categories>` 명시
- `<keywords>` (영어 + 한국어 변형 5개)
- `<branding>` light/dark 컬러
- `<url type="contribute">`, `<url type="translate">` 추가
- `<content_rating>` 전체 attribute 명시 (none)
- 두 번째 screenshot (한국어 UI) 추가
- `<recommends><internet>always</internet>` — network 권한 정당화
- `<supports><control>touch</control>` 추가
- 릴리스 entry에 `<url type="details">` 추가
- 한국어 `xml:lang="ko"` 변형 (name, summary, developer name, keywords)

### 추가로 운영자가 채워야 할 것

- **screenshots 5장 권장** (현재 2장). standard / unit / currency / radix / formula 각 1장. 모두 main 브랜치 `assets/`에 commit해서 `raw.githubusercontent.com/...` URL이 200 OK여야 함
- **0.12.1 (또는 다음 릴리스) entry**: 실제 release 시점에 다음 추가 (날짜는 ISO 8601, 미래 날짜 금지):
  ```xml
  <release version="0.12.1" date="2026-XX-XX">
    <url type="details">https://github.com/from104/qcalc/releases/tag/v0.12.1</url>
    <description>
      <p>Maintenance release for Flathub submission.</p>
    </description>
  </release>
  ```
- (선택) **`<url type="donation">`** — GitHub Sponsors 활성화 시 추가
- (선택) **`<url type="contact">`** — `mailto:from104@gmail.com` 공개 OK면

### 검증

```bash
flatpak run --command=appstreamcli org.flatpak.Builder validate \
  --strict --pedantic flatpak/io.github.from104.qcalc.metainfo.xml
```

warning도 fatal로 처리됨. 0 error / 0 warning 목표.

---

## 9. Desktop 파일과 아이콘

[`io.github.from104.qcalc.desktop`](io.github.from104.qcalc.desktop)은 본 PR로 보강 완료:

- `Name[ko]`, `GenericName[ko]`, `Comment[ko]` 한국어 localization
- `Keywords` 확장 (`scientific`, `radix`, `binary`, `hexadecimal`, `formula` 추가)
- `Keywords[ko]` 한국어 변형
- `StartupNotify=true` 추가
- 빈 `MimeType=` 라인 제거

### 추가 권장 (TODO)

- 나머지 8개 언어(ja/zh/hi/de/es/fr/pt/ru) Name/GenericName/Comment/Keywords localization — `src/i18n/messages/` 번역 활용

### 아이콘

현재 [icons/io.github.from104.qcalc.png](icons/io.github.from104.qcalc.png)는 512x512 PNG. Flathub는 `hicolor/<actual-size>/apps/`에 설치할 것을 권장 — 현재 매니페스트 `256x256` 경로는 잘못이므로 신규 매니페스트(5절)에서 `512x512`로 설치한다.

**더 좋은 옵션**: SVG 마스터를 별도 export(`assets/qcalc_icon_v3.png` → Inkscape로 SVG 트레이스)해서 `scalable/apps/`에 설치하면 모든 DPI에서 선명. **권장이지 필수 아님**.

---

## 10. flathub.json

제출 리포 root에 다음 내용으로 새로 작성:

```json
{
  "only-arches": ["x86_64", "aarch64"],
  "automerge-flathubbot-prs": true,
  "require-important-update": false
}
```

- `only-arches`: aarch64 빌드 미검증이면 `["x86_64"]`만으로 시작
- `automerge-flathubbot-prs`: `x-checker-data`가 새 버전 감지해 PR 올렸을 때 자동 머지

### x-checker-data 어노테이션

매니페스트의 본 앱 source에 추가하면 [`flatpak-external-data-checker`](https://github.com/flathub-infra/flatpak-external-data-checker)가 자동으로 GitHub Releases 모니터링 → 새 태그 나오면 sha256 갱신 PR 생성.

```yaml
- type: archive
  url: https://github.com/from104/qcalc/archive/refs/tags/v0.12.1.tar.gz
  sha256: <hash>
  x-checker-data:
    type: anitya
    project-id: <register-on-release-monitoring.org>
    stable-only: true
    url-template: https://github.com/from104/qcalc/archive/refs/tags/v$version.tar.gz
```

또는 GitHub Releases 직접 모니터링:

```yaml
x-checker-data:
  type: json
  url: https://api.github.com/repos/from104/qcalc/releases/latest
  version-query: .tag_name | sub("^v"; "")
  url-query: .tarball_url
```

---

## 11. 로컬 검증 절차

제출 전에 Flathub 리뷰어가 돌리는 모든 lint를 로컬에서 통과해야 한다.

### 1단계: 도구 설치

```bash
flatpak install --user flathub org.flatpak.Builder
flatpak install --user flathub org.freedesktop.Platform//25.08
flatpak install --user flathub org.freedesktop.Sdk//25.08
flatpak install --user flathub org.electronjs.Electron2.BaseApp//25.08
flatpak install --user flathub org.freedesktop.Sdk.Extension.node22//25.08
```

### 2단계: 매니페스트 lint

```bash
flatpak run --command=flatpak-builder-lint org.flatpak.Builder \
  manifest io.github.from104.qcalc.yml
```

0 error 목표. exception 받는 룰 외엔 모두 fix.

### 3단계: 빌드

```bash
flatpak run --command=flathub-build org.flatpak.Builder \
  --install --user --repo=repo io.github.from104.qcalc.yml
```

첫 빌드는 30~60분 (Yarn install + Quasar build + Electron unpack).

### 4단계: repo lint

```bash
flatpak run --command=flatpak-builder-lint org.flatpak.Builder \
  repo repo
```

내부적으로 `appstreamcli validate` + desktop-file 검증 수행.

### 5단계: 실행 테스트

```bash
flatpak run io.github.from104.qcalc
```

- 정상 실행 확인
- Currency Converter에서 환율 가져와지는지 (network 권한 동작)
- 설정 변경 후 종료/재실행 시 영속화 확인
- Wayland + X11 둘 다 테스트

### 6단계: appstreamcli pedantic

```bash
flatpak run --command=appstreamcli org.flatpak.Builder \
  validate --strict --pedantic io.github.from104.qcalc.metainfo.xml
```

위 6단계를 자동화한 헬퍼 스크립트: [`lint-local.sh`](lint-local.sh) (본 PR로 추가).

---

## 12. Flathub 제출 PR 절차

### 1) Fork 준비

```bash
# github.com/flathub/flathub fork (UI에서 "Copy the master branch only" 체크 해제 — new-pr 브랜치도 받아야 함)
git clone --branch=new-pr git@github.com:from104/flathub.git
cd flathub
git checkout -b add-io.github.from104.qcalc
```

### 2) 파일 배치

```bash
cp /home/from104/work/qcalc/flatpak-submission/io.github.from104.qcalc.yml .
cp /home/from104/work/qcalc/flatpak/io.github.from104.qcalc.metainfo.xml .
cp /home/from104/work/qcalc/flatpak/io.github.from104.qcalc.desktop .
cp /home/from104/work/qcalc/flatpak/icons/io.github.from104.qcalc.png .
cp /home/from104/work/qcalc/flatpak-submission/generated-sources.json .
cp /home/from104/work/qcalc/flatpak-submission/flatpak-yarn-berry.js .
cat > flathub.json <<'EOF'
{
  "only-arches": ["x86_64"],
  "automerge-flathubbot-prs": true
}
EOF
git add .
git commit -m 'Add io.github.from104.qcalc'
git push -u origin add-io.github.from104.qcalc
```

### 3) PR 열기

- **Base 브랜치 반드시 `new-pr`** (master 아님 — master로 열면 자동 거부)
- **PR 제목 정확히**: `Add io.github.from104.qcalc`
- PR description: Flathub 템플릿 모든 항목 채움 (스크린샷 URL 포함 — storefront 노출)

### 4) 빌드 트리거

PR 코멘트에 `bot, build` 입력 → Flathub Buildbot이 임시 빌드.

### 5) 리뷰 대응

- 리뷰어 코멘트에 commits로 응답 (force-push 가능)
- **PR을 close/reopen 절대 금지** — Flathub 문서 명시 (리뷰 컨텍스트 깨짐)
- master 머지/리베이스 금지 — `new-pr` 베이스 유지

### 6) 승인 → 머지

승인 후 Flathub 메인테이너가 batch 머지. 자동으로 `flathub/io.github.from104.qcalc` 리포 생성 + 운영자에게 write 권한 초대 메일 (1주 만료, GitHub 2FA 필수).

---

## 13. 머지 후 운영

### 초대 수락

GitHub 2FA 활성화된 상태로 1주 내 초대 수락.

### 채널

- `master` 브랜치 push → Flathub `stable` remote 자동 배포
- `beta` 브랜치 push → Flathub `beta` remote 자동 배포
- 다른 브랜치 사용 금지 (BaseApp/Extension용 prefix 예약)

### 업데이트 흐름

1. QCalc 본 리포에서 새 버전 태그 push (v0.12.x)
2. Flathub bot이 24h 내 감지 (`x-checker-data` + `automerge-flathubbot-prs`)
3. `flathub/io.github.from104.qcalc`에 자동 PR 생성 — sha256 갱신
4. 자동 머지 → master 빌드 → stable remote

### 의존성 변경 시

`yarn.lock`이 바뀌면 자동화 안 됨. 수동 작업:

```bash
python3 /tmp/fbt/node/flatpak-node-generator.py --type yarn --yarn-berry yarn.lock -o generated-sources.json
git -C flathub-repo add generated-sources.json && git commit -m 'Regenerate yarn sources for vX.Y.Z'
git push origin master
```

---

## 14. 운영자 사전 체크리스트

제출 PR 열기 **전에** 사람이 직접 해야 하는 항목:

- [ ] GitHub 계정 2FA 활성화 (Flathub 초대 수락 필수 조건)
- [ ] `from104.github.io` 페이지 활성화 — 빈 페이지로도 OK, 200 OK 반환 확인
- [ ] Screenshots 5장 촬영 및 본 리포 `assets/`에 commit:
  - `screenshot_v0.12.x.png` (standard)
  - `screenshot_v0.12.x_unit.png`
  - `screenshot_v0.12.x_currency.png`
  - `screenshot_v0.12.x_radix.png`
  - `screenshot_v0.12.x_formula.png`
  - - 각각 한국어 변형 (`-ko.png`)
- [ ] `raw.githubusercontent.com/from104/qcalc/main/assets/screenshot_*.png` URL이 전부 200 OK 반환하는지 검증
- [ ] v0.12.1 (또는 제출 대상 버전) GitHub Release published 상태 — pre-release 아님
- [ ] 본 리포 v0.12.x tarball의 sha256 계산:
  ```bash
  curl -sL https://github.com/from104/qcalc/archive/refs/tags/v0.12.x.tar.gz | sha256sum
  ```
- [ ] `flatpak-yarn-berry.js` sha256 계산:
  ```bash
  curl -sL https://github.com/flatpak/flatpak-builder-tools/raw/master/node/flatpak-yarn-berry.js | sha256sum
  ```
- [ ] Currency exchange API 엔드포인트 도메인 목록 정리 (리뷰어 질문 대비)
- [ ] Donation/sponsor URL 결정 (GitHub Sponsors 활성화 or omit)
- [ ] Contact 이메일 공개 노출 OK 확인 (또는 omit)
- [ ] 실제 shipping 언어 수 최종 확정 (현재 10개 — metainfo와 일치)
- [ ] (선택) SVG 마스터 아이콘 export
- [ ] 로컬 빌드 + lint 6단계 (11절) **0 error / 0 warning** 통과
- [ ] [release-monitoring.org](https://release-monitoring.org)에 anitya 프로젝트 등록 (x-checker-data anitya type 쓰려면)

---

## 15. 자주 발생하는 거부 사유

| 사유                                             | 회피                                                       |
| ------------------------------------------------ | ---------------------------------------------------------- |
| PR target이 `master`                             | 반드시 `new-pr` 베이스                                     |
| PR 제목 형식 어긋남                              | 정확히 `Add <app-id>`                                      |
| `type: dir` + 사전 빌드 산출물                   | **exception never granted** — in-sandbox build 필수        |
| 빌드 중 네트워크 호출                            | offline 환경변수 + 사전 벤더링 필수                        |
| metainfo `appstreamcli validate` warning 1개라도 | warning도 fatal — pedantic 모드까지 0                      |
| EOL runtime 사용                                 | 매 제출 시 최신 runtime 확인 (24.08 → 25.08)               |
| `--filesystem=home` 같은 광범위 정적 권한        | Portal 우선 (FileChooser, Notification)                    |
| 라이선스 파일 미설치                             | `$FLATPAK_DEST/share/licenses/$FLATPAK_ID/`에 LICENSE 설치 |
| 후원 link가 storefront 정책 위반                 | crypto/sketchy donation 금지                               |
| 스크린샷 URL이 404                               | main 브랜치 raw URL로 사전 검증                            |
| Electron app인데 sandbox 비활성                  | `app.enableSandbox()` 또는 `--enable-sandbox` 확인         |

---

## 16. 부록 A — 현재 vs 제출용 파일 매핑

| 본 리포 (`flatpak/`)                   | 제출 리포 root                       | 변환 필요?                         |
| -------------------------------------- | ------------------------------------ | ---------------------------------- |
| `io.github.from104.qcalc.yml`          | `io.github.from104.qcalc.yml`        | **전면 재작성** (5절 참조)         |
| `io.github.from104.qcalc.metainfo.xml` | 동일                                 | 그대로 복사 (현 PR로 보강 완료)    |
| `io.github.from104.qcalc.desktop`      | 동일                                 | 그대로 복사 (현 PR로 보강 완료)    |
| `icons/io.github.from104.qcalc.png`    | `io.github.from104.qcalc.png` (root) | 그대로 복사                        |
| `build-flatpak.sh`                     | —                                    | 로컬 전용, 제출 안 함              |
| (없음)                                 | `generated-sources.json`             | flatpak-node-generator로 신규 생성 |
| (없음)                                 | `flatpak-yarn-berry.js`              | 다운로드 + sha256 핀               |
| (없음)                                 | `flathub.json`                       | 신규 작성                          |

---

## 17. 부록 B — 향후 로드맵

제출 후 추가로 채울 수 있는 품질 항목 (블로커 아님):

- **FileChooser portal 도입**: 설정/히스토리 export/import를 `--filesystem` 없이 portal로 — 현재 Electron의 `dialog.showOpenDialog`/`showSaveDialog`는 자동으로 portal 사용함. 추가 작업 거의 없음.
- **Notification portal**: 환율 업데이트 알림 등에 사용
- **Autostart portal**: 백그라운드 환율 자동 갱신 (현재 미사용, 도입 시)
- **beta 채널 활용**: 큰 변경은 `beta` 브랜치에서 dogfooding
- **ARM aarch64 지원**: x86_64에서 안정화 후 only-arches에 추가
- **License file 자동 install**: 매니페스트에 명시적으로 추가 (`install -Dm644 LICENSE $FLATPAK_DEST/share/licenses/$FLATPAK_ID/LICENSE`)
- **SVG 아이콘**: 모든 DPI에서 선명

---

## 18. 참고 자료

- [Flathub for-app-authors 문서](https://docs.flathub.org/docs/for-app-authors)
- [Flathub Quality Guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines)
- [Flathub Linter rules](https://docs.flathub.org/docs/for-app-authors/linter)
- [Flathub Layered Safety](https://docs.flathub.org/blog/app-safety-layered-approach-source-to-user)
- [AppStream MetaInfo spec](https://www.freedesktop.org/software/appstream/docs/)
- [appstreamcli validate issue tags](https://www.freedesktop.org/software/appstream/docs/chap-Validation.html)
- [XDG Desktop Entry Specification](https://specifications.freedesktop.org/desktop-entry-spec/latest/)
- [Reverse-DNS Naming convention](https://docs.flathub.org/docs/for-app-authors/requirements)
- [flatpak-builder-tools (node generator)](https://github.com/flatpak/flatpak-builder-tools/tree/master/node)
- [flatpak-external-data-checker](https://github.com/flathub-infra/flatpak-external-data-checker)

### Reference Flathub manifests

- [electron-sample-app](https://github.com/flathub/com.github.flathub.electron-sample-app) — 공식 레퍼런스
- [Joplin](https://github.com/flathub/net.cozic.joplin_desktop) — Yarn Berry
- [Logseq](https://github.com/flathub/com.logseq.Logseq)
- [Standard Notes](https://github.com/flathub/org.standardnotes.standardnotes)
- [Obsidian](https://github.com/flathub/md.obsidian.Obsidian) — Electron + external-data-checker 좋은 예
