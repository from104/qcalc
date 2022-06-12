# com.electron.qcalc (qcalc)

## 퀘이사를 이용해 만든 간단한 계산기

예전에 졸업과제로 만들었던 안드로이드용 계산가의 소스를 활용해 만든 간단한 계산기 입니다.

## 필요한 node.js 모듈 설치

기본적으로 필요한 모듈 설치법은 다음과 같습니다.

```bash
yarn
# or
npm install
```

### 개발 모드로 실행하기 (실시간 리로딩, 에러 체크 등)

```bash
quasar dev -m electron
```

### 배포 패키지 빌드 (윈도우용)

```bash
quasar build -m electron [-T win32]
```
