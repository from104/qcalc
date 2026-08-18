; QCalc Windows 인스톨러 훅 — 0.12.x(Electron) 설치를 걷어내고 올라온다.
;
; 두 빌드는 **설치 위치가 다르다.**
;   Electron(electron-builder, ~0.12.0) : $LOCALAPPDATA\Programs\QCalc
;   Tauri(0.13.0~)                      : $LOCALAPPDATA\QCalc
; 그래서 그냥 설치하면 옛 설치가 약 370MB(실행 파일 222MB + app.asar 148MB)와
; 앱 목록 항목을 남긴 채 나란히 남는다. 사용자 눈에는 QCalc이 두 개로 보인다.
;
; 계산 기록 등 사용자 데이터는 %APPDATA%\QCalc(로밍)에 있고 여기서 건드리지 않는다.

!macro NSIS_HOOK_PREINSTALL
  Push $R9
  StrCpy $R9 "$LOCALAPPDATA\Programs\${PRODUCTNAME}"

  ; 옛 설치가 없으면(새로 설치하는 대부분의 경우) 할 일이 없다.
  IfFileExists "$R9\*.*" 0 qcalc_legacy_done

    DetailPrint "Removing the previous Electron-based installation"

    ; 언인스톨러가 남아 있으면 그것부터 돌린다 — 무엇을 깔았는지는 그쪽이 가장 정확히
    ; 알고, 레지스트리 제거 항목과 시작 메뉴 바로 가기도 같이 정리해 준다.
    ;
    ; `_?=` 를 붙이지 않으면 NSIS 언인스톨러는 자기를 임시 폴더로 복사한 뒤 거기서 돌고
    ; 원래 프로세스는 즉시 끝나므로 ExecWait 가 기다리지 못한다. 붙이면 제자리에서 돌아
    ; 기다릴 수 있는 대신 자기 자신은 지우지 않는다.
    IfFileExists "$R9\Uninstall ${PRODUCTNAME}.exe" 0 +3
      ExecWait '"$R9\Uninstall ${PRODUCTNAME}.exe" /S _?=$R9'
      Delete "$R9\Uninstall ${PRODUCTNAME}.exe"

    ; 언인스톨러가 없거나(수동 삭제) 남긴 것이 있으면 폴더째 걷어낸다.
    ; 이 경로는 옛 QCalc 전용이고 사용자 데이터는 들어 있지 않다.
    RMDir /r "$R9"
    ; Programs 폴더는 다른 앱도 쓴다 — 비어 있을 때만 지워지도록 /r 없이 부른다.
    RMDir "$LOCALAPPDATA\Programs"

  qcalc_legacy_done:
  Pop $R9
!macroend
