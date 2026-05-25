# Tauri Updater 운영 가이드

QCalc의 Tauri 빌드에 자동 업데이트를 활성화하기 위한 운영자 문서. 코드 레벨 준비는 이미 완료되어 있으며(플러그인 등록, JS 브릿지, GitHub Actions 워크플로), 실제 활성화는 아래의 수동 단계를 거쳐야 한다.

## 현재 상태

| 항목                              | 상태           | 위치                                                                                               |
| --------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- |
| Rust 플러그인 등록                | ✅             | [`src/lib.rs`](src/lib.rs) — Snap/Flatpak 제외                                                     |
| Capability 권한                   | ✅             | [`capabilities/default.json`](capabilities/default.json) — `updater:default`                       |
| JS 브릿지                         | ✅             | [`../src/boot/tauri-shim.ts`](../src/boot/tauri-shim.ts)                                           |
| CI 워크플로 (빌드)                | ✅             | [`../.github/workflows/tauri-release.yml`](../.github/workflows/tauri-release.yml)                 |
| CI 워크플로 (manifest promote)    | ✅             | [`../.github/workflows/tauri-updater-promote.yml`](../.github/workflows/tauri-updater-promote.yml) |
| 공개키 (`plugins.updater.pubkey`) | ✅             | [`tauri.conf.json`](tauri.conf.json)                                                               |
| endpoint (고정 롤링 URL)          | ✅             | [`tauri.conf.json`](tauri.conf.json)                                                               |
| **개인키 백업**                   | ❌ 운영자 작업 | 암호화 외부 저장소                                                                                 |
| **GitHub Secrets**                | ❌ 운영자 작업 | GitHub Repo Settings                                                                               |

GitHub Secrets가 등록되기 전까지는 CI 빌드가 서명에 실패하므로 릴리스를 만들 수 없다. 또한 첫 `tauri-updater` 롤링 릴리스가 생성되기 전까지 JS shim의 `checkForUpdates()` 호출은 조용히 `'not-available'`로 fallback 된다 (Electron의 "업데이트 없음" UX와 동일).

## `plugins.updater.endpoints`란?

Tauri 앱이 실행 중 `check()`를 호출할 때 **"최신 버전 정보 JSON"을 어느 URL로 요청할지** 지정하는 배열. 배열의 각 항목은 HTTPS URL(dev 모드에서만 HTTP 허용)이며, 첫 번째 URL이 non-2XX를 반환하면 다음 URL로 fallback 된다.

### 두 가지 호스팅 방식

#### 방식 A — GitHub 정적 JSON + 고정 롤링 릴리스 (QCalc 채택)

배포 자동화 친화적. `tauri-action`이 빌드 아티팩트로부터 `latest.json`을 **자동 생성**해 버전 릴리스(`tauri-v*`) 에셋으로 업로드하고, 별도 promote 워크플로가 그 `latest.json`을 버전과 무관한 **고정 `tauri-updater` 롤링 릴리스**로 복사한다. 앱은 항상 이 고정 URL을 조회한다. 운영자는 JSON을 손으로 편집할 필요 없음.

```json
"plugins": {
  "updater": {
    "pubkey": "...",
    "endpoints": [
      "https://github.com/from104/qcalc/releases/download/tauri-updater/latest.json"
    ]
  }
}
```

> **왜 `releases/latest`가 아니라 고정 태그인가?** GitHub의 `releases/latest`는 *모든 릴리스 중 최신*을 가리킨다. Electron 릴리스(`v0.12.x`)가 Tauri 릴리스(`tauri-v*`)보다 나중에 나오면 앱이 Electron 릴리스의 `latest.json`(없음)을 조회해 404가 된다. 버전과 무관한 고정 `tauri-updater` 태그를 쓰면 이 충돌이 원천 차단된다. 자세한 내용은 [주의 사항](#릴리스-태그-스킴과-latest-충돌-해결) 참조.

**동작 흐름**

1. 앱이 위 고정 URL로 HTTP GET
2. GitHub가 `tauri-updater` 릴리스의 `latest.json` 자산으로 리다이렉트
3. 앱이 JSON을 파싱해 `version > 현재 버전`이면 `'available'` 이벤트 발생
4. 사용자가 업데이트 동의 → `.sig` 서명 검증 후 다운로드·설치·재시작

**`latest.json` 구조 (tauri-action 자동 생성)**

```json
{
  "version": "0.12.2",
  "notes": "버그 수정과 성능 개선",
  "pub_date": "2026-04-15T10:00:00Z",
  "platforms": {
    "linux-x86_64": {
      "signature": "untrusted comment: signature from tauri secret key...\nRWS...",
      "url": "https://github.com/from104/qcalc/releases/download/tauri-v0.12.2/QCalc_0.12.2_amd64.AppImage.tar.gz"
    }
  }
}
```

- `platforms` 키는 `OS-ARCH` 포맷 (`linux-x86_64`, `windows-x86_64`, `darwin-aarch64`)
- `signature`는 빌드 시 생성된 `.sig` 파일의 **내용**(경로 아님)
- `url`은 해당 플랫폼 번들의 다운로드 주소
- `notes`, `pub_date`는 optional

#### 방식 B — 동적 서버 (QCalc 미사용)

자체 API 서버가 클라이언트의 현재 버전·플랫폼·아키텍처를 받아 업데이트 유무를 응답하는 방식. 점진 rollout이나 A/B 테스팅에 유리하지만 서버 운영 부담이 있어 QCalc 스케일엔 오버엔지니어링.

URL 변수 치환 지원: `{{target}}` / `{{arch}}` / `{{current_version}}`.

응답이 없으면 `204 No Content`를 반환해야 하며, 있으면 단일 플랫폼 JSON을 반환:

```json
{
  "version": "0.12.2",
  "pub_date": "...",
  "url": "...",
  "signature": "...",
  "notes": "..."
}
```

## 활성화 절차 (1회성)

### 1. 서명 키 생성

```bash
yarn tauri signer generate -w ~/.tauri/qcalc.key
```

- 강한 password 설정 권장 (CLI가 묻는다)
- 생성 결과: `~/.tauri/qcalc.key` (개인키, **비밀**) + `~/.tauri/qcalc.key.pub` (공개키, 공개 가능)
- **⚠️ 개인키 분실 = 기존 설치자에게 업데이트 배포 불가능** (복구 불가). 암호화된 외부 저장소(password manager, encrypted backup)에 반드시 백업.

### 2. `tauri.conf.json` 업데이트

```bash
cat ~/.tauri/qcalc.key.pub
```

출력 내용 전체를 복사해서 [`tauri.conf.json`](tauri.conf.json)에 다음과 같이 추가:

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "createUpdaterArtifacts": true,
    "icon": [...]
  },
  "plugins": {
    "updater": {
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXkgLi4uClJXU...",
      "endpoints": [
        "https://github.com/from104/qcalc/releases/download/tauri-updater/latest.json"
      ]
    }
  }
}
```

**`createUpdaterArtifacts: true`** 플래그가 있어야 번들링 시 `.sig` 서명 파일이 함께 생성된다.

### 3. GitHub Secrets 등록

GitHub Repo > Settings > Secrets and variables > Actions > New repository secret:

| Secret 이름                          | 값                                 |
| ------------------------------------ | ---------------------------------- |
| `TAURI_SIGNING_PRIVATE_KEY`          | `cat ~/.tauri/qcalc.key` 출력 전체 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 1단계에서 설정한 password          |

### 4. 개인키 백업

`~/.tauri/qcalc.key`를 암호화된 외부 저장소에 보관. 분실 위험 경감.

## 첫 릴리스

```bash
# package.json 버전 업데이트 (예: 0.12.2)
# 커밋 & 태그
git commit -am "chore(tauri): release 0.12.2"
git tag tauri-v0.12.2
git push origin tauri-v0.12.2
```

이후 GitHub Actions `tauri-release` 워크플로가 자동으로:

1. Ubuntu / Windows runner에서 Rust + 빌드 의존성 설치
2. `yarn install --immutable`
3. `tauri-apps/tauri-action@v0`이 `yarn build:tauri` 실행
4. `.deb`, `.AppImage`, `.exe`(NSIS), `.sig` 파일 생성
5. `latest.json` 매니페스트 생성 (매트릭스 잡들이 같은 릴리스에 플랫폼을 병합)
6. GitHub Release **draft**로 업로드

draft 상태로 생성되므로 수동 검증 후 "Publish release"를 클릭해야 한다.

### Publish 후: manifest promote (필수)

버전 릴리스를 Publish 한 뒤, **반드시** `tauri-updater-promote` 워크플로를 실행해야 업데이터가 동작한다.

> Actions 탭 > **tauri-updater-promote** > Run workflow > `tag`에 방금 publish한 태그 입력 (예: `tauri-v0.12.2`)

이 워크플로는 버전 릴리스의 `latest.json`을 고정 `tauri-updater` 롤링 릴리스로 복사한다. 앱의 endpoint가 이 고정 URL을 조회하므로 Electron 릴리스와의 `latest` 충돌이 발생하지 않는다.

**순서가 중요하다.** `latest.json` 내부의 다운로드 URL은 버전 릴리스(`tauri-v0.12.2`)의 에셋을 가리킨다. 버전 릴리스를 Publish하기 _전에_ promote하면, 사용자에게는 새 버전이 보이지만 다운로드는 404가 된다. 항상 **버전 릴리스 Publish → promote 실행** 순서를 지킨다.

## 주의 사항

### 릴리스 태그 스킴과 `latest` 충돌 해결

GitHub의 `releases/latest`는 **모든 릴리스 중 최신**을 가리킨다. Electron 릴리스(`v0.12.x`)가 Tauri 릴리스(`tauri-v*`)보다 나중에 나오면, `releases/latest/download/latest.json`을 조회하던 Tauri 앱이 Electron 릴리스의 `latest.json`(없음)을 받아 404가 된다.

**채택한 해법 — 고정 롤링 릴리스.** 버전과 무관한 고정 태그 `tauri-updater` 릴리스 하나를 두고, 매 릴리스마다 [`tauri-updater-promote`](../.github/workflows/tauri-updater-promote.yml) 워크플로가 그 릴리스의 `latest.json` 에셋을 최신 내용으로 덮어쓴다. 앱 endpoint는 이 고정 URL(`releases/download/tauri-updater/latest.json`)만 조회하므로 Electron 릴리스가 아무리 추가돼도 영향이 없다.

- `tauri-updater` 릴리스는 `--latest=false`로 생성되어 `releases/latest` 판정에서 제외된다 (Electron updater에 영향 없음).
- 운영자가 endpoints URL을 매 릴리스마다 수정할 필요가 없다.
- 단점: 버전 릴리스 Publish 후 promote 워크플로를 1회 수동 실행해야 한다 ([첫 릴리스](#publish-후-manifest-promote-필수) 참조).

### HTTPS 강제

프로덕션 빌드는 HTTPS endpoint만 허용. dev 빌드는 HTTP 가능.

### 공개키는 공개 가능

`pubkey`는 저장소에 커밋해도 안전. 서명 검증용이며 암호화 키가 아님. **개인키만 비밀**.

### Snap/Flatpak 환경

Rust 측 `is_sandboxed()` 체크로 Snap/Flatpak 빌드에서는 플러그인 자체가 등록되지 않는다. 이 환경은 각 패키지 시스템의 자체 업데이트 메커니즘(snapd, flatpak-update)에 의존 (Electron 동작과 동일 정책).

## 검증

활성화 후 다음 순서로 검증:

1. **로컬 빌드**: `TAURI_SIGNING_PRIVATE_KEY=$(cat ~/.tauri/qcalc.key) TAURI_SIGNING_PRIVATE_KEY_PASSWORD=<pw> yarn build:tauri` → `src-tauri/target/release/bundle/`에 `.deb`, `.AppImage`, `.sig` 파일 생성 확인
2. **GitHub Actions 빌드**: `tauri-v0.12.2` 태그 푸시 → Actions 실행 → draft 릴리스에 `.deb`, `.AppImage`, `.exe`, `latest.json`(linux+windows 플랫폼 병합) 에셋 확인
3. **Manifest promote**: draft 버전 릴리스 Publish → `tauri-updater-promote` 워크플로 실행 → `https://github.com/from104/qcalc/releases/download/tauri-updater/latest.json`이 공개 조회되고 최신 버전·플랫폼을 담고 있는지 확인
4. **End-to-end 업데이트**: 로컬에 이전 버전(`0.12.1`) Tauri 빌드 설치 → 앱 실행 → 업데이트 확인 → 다운로드·설치·재시작 → `0.12.2`로 갱신 확인
5. **서명 검증 실패 시나리오**: `latest.json`의 `signature` 필드를 의도적으로 훼손한 테스트 릴리스 → 앱이 서명 검증 실패로 설치 거부하는지 확인
6. **샌드박스 회귀**: Snap/Flatpak 빌드에서 updater가 조용히 스킵되는지 확인
7. **Electron 영향 없음**: 기존 electron-updater 플로가 그대로 작동하는지, `releases/latest`가 여전히 Electron 릴리스를 가리키는지 회귀 확인

## 참고 자료

- [Tauri Updater 공식 문서](https://v2.tauri.app/plugin/updater/)
- [tauri-apps/tauri-action@v0](https://github.com/tauri-apps/tauri-action)
- [최신 latest.json 스키마](https://v2.tauri.app/plugin/updater/#server-support)
