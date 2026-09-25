// 첫 페인트 배경색 — CSS·앱 JS 로드 전에 직전 실행의 테마 배경으로 칠해 흰 화면 깜빡임을 막는다.
// 값은 themesStore.updateTheme 이 저장한다. 운영 CSP(script-src 'self') 때문에 인라인이 아닌 파일로 둔다.
try {
  var c = localStorage.getItem('qcalc-boot-bg');
  if (c) document.documentElement.style.backgroundColor = c;
} catch {
  /* 무시 */
}

// 저사양 기기(코어 2개 이하 또는 메모리 2GB 이하)는 애니메이션을 자동으로 줄인다 — app.scss 의 html.motion-reduced
try {
  var n = navigator;
  if ((n.hardwareConcurrency && n.hardwareConcurrency <= 2) || (n.deviceMemory && n.deviceMemory <= 2)) {
    document.documentElement.classList.add('motion-reduced');
  }
} catch {
  /* 무시 */
}
