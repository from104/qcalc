@echo off
setlocal enabledelayedexpansion

:: 빌드 디렉토리 설정
set "BUILD_DIR=.\package"

:: 버전 정보 추출
for /f "tokens=2 delims=:, " %%a in ('findstr /c:"\"version\"" package.json') do (
    set "VERSION=%%~a"
    set "VERSION=!VERSION:"=!"
    goto :version_extracted
)
:version_extracted

if "%VERSION%"=="" (
    echo Error: Could not extract version from package.json.
    exit /b 1
)
echo Building version %VERSION%...

:: Node.js와 Yarn 설치 여부 및 버전 체크
:check_versions
echo Checking Node.js and Yarn installation...

:: Node.js 설치 확인
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org.
    exit /b 1
)

:: Yarn 설치 확인
where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Yarn is not installed.
    echo Please install Yarn using 'npm install -g yarn'.
    exit /b 1
)

:: package.json에서 Node.js 필수 버전 추출
for /f "tokens=2 delims=:, " %%a in ('findstr /c:"\"node\"" package.json') do (
    set "REQUIRED_NODE_VERSION=%%~a"
    set "REQUIRED_NODE_VERSION=!REQUIRED_NODE_VERSION:^=!"
    set "REQUIRED_NODE_VERSION=!REQUIRED_NODE_VERSION:"=!"
    set "REQUIRED_NODE_VERSION=!REQUIRED_NODE_VERSION:~1!"
    goto :node_version_extracted
)
:node_version_extracted

:: 현재 Node.js 버전 추출
for /f "tokens=1 delims=v" %%a in ('node -v') do (
    set "CURRENT_NODE_VERSION=%%a"
)

if not defined REQUIRED_NODE_VERSION (
    echo Warning: Node.js required version not found in package.json. Skipping Node.js version check.
) else (
    for /f "tokens=1-3 delims=." %%i in ("!REQUIRED_NODE_VERSION!") do (
        set "REQ_NODE_MAJOR=%%i"
        set "REQ_NODE_MINOR=%%j"
        set "REQ_NODE_PATCH=%%k"
    )
    for /f "tokens=1-3 delims=." %%i in ("!CURRENT_NODE_VERSION!") do (
        set "CUR_NODE_MAJOR=%%i"
        set "CUR_NODE_MINOR=%%j"
        set "CUR_NODE_PATCH=%%k"
    )

    if !CUR_NODE_MAJOR! LSS !REQ_NODE_MAJOR! (
        echo Error: Node.js version !REQUIRED_NODE_VERSION! or higher is required.
        echo Current version: !CURRENT_NODE_VERSION!
        exit /b 1
    ) else if !CUR_NODE_MAJOR! EQU !REQ_NODE_MAJOR! (
        if !CUR_NODE_MINOR! LSS !REQ_NODE_MINOR! (
            echo Error: Node.js version !REQUIRED_NODE_VERSION! or higher is required.
            echo Current version: !CURRENT_NODE_VERSION!
            exit /b 1
        ) else if !CUR_NODE_MINOR! EQU !REQ_NODE_MINOR! (
            if !CUR_NODE_PATCH! LSS !REQ_NODE_PATCH! (
                echo Error: Node.js version !REQUIRED_NODE_VERSION! or higher is required.
                echo Current version: !CURRENT_NODE_VERSION!
                exit /b 1
            )
        )
    )
)

:: package.json에서 Yarn 필수 버전 추출
for /f "tokens=2 delims=:, " %%a in ('findstr /c:"\"yarn\"" package.json') do (
    set "REQUIRED_YARN_VERSION=%%~a"
    set "REQUIRED_YARN_VERSION=!REQUIRED_YARN_VERSION:^=!"
    set "REQUIRED_YARN_VERSION=!REQUIRED_YARN_VERSION:"=!"
    set "REQUIRED_YARN_VERSION=!REQUIRED_YARN_VERSION:~1!"
    goto :yarn_version_extracted
)
:yarn_version_extracted

:: 현재 Yarn 버전 추출
for /f "tokens=1 delims=v" %%a in ('yarn -v') do (
    set "CURRENT_YARN_VERSION=%%a"
)

if not defined REQUIRED_YARN_VERSION (
    echo Warning: Yarn required version not found in package.json. Skipping Yarn version check.
) else (
    for /f "tokens=1-3 delims=." %%i in ("!REQUIRED_YARN_VERSION!") do (
        set "REQ_YARN_MAJOR=%%i"
        set "REQ_YARN_MINOR=%%j"
        set "REQ_YARN_PATCH=%%k"
    )
    for /f "tokens=1-3 delims=." %%i in ("!CURRENT_YARN_VERSION!") do (
        set "CUR_YARN_MAJOR=%%i"
        set "CUR_YARN_MINOR=%%j"
        set "CUR_YARN_PATCH=%%k"
    )

    if !CUR_YARN_MAJOR! LSS !REQ_YARN_MAJOR! (
        echo Error: Yarn version !REQUIRED_YARN_VERSION! or higher is required.
        echo Current version: !CURRENT_YARN_VERSION!
        exit /b 1
    ) else if !CUR_YARN_MAJOR! EQU !REQ_YARN_MAJOR! (
        if !CUR_YARN_MINOR! LSS !REQ_YARN_MINOR! (
            echo Error: Yarn version !REQUIRED_YARN_VERSION! or higher is required.
            echo Current version: !CURRENT_YARN_VERSION!
            exit /b 1
        ) else if !CUR_YARN_MINOR! EQU !REQ_YARN_MINOR! (
            if !CUR_YARN_PATCH! LSS !REQ_YARN_PATCH! (
                echo Error: Yarn version !REQUIRED_YARN_VERSION! or higher is required.
                echo Current version: !CURRENT_YARN_VERSION!
                exit /b 1
            )
        )
    )
)

echo Node.js and Yarn versions are sufficient.

:: .env 파일 로드
:load_env
if exist .env (
    echo Loading environment variables from .env file...
    for /f "tokens=*" %%a in (.env) do (
        echo %%a | findstr /r /c:"^#" >nul || (
            for /f "tokens=1* delims==" %%b in ("%%a") do (
                set "%%b=%%c"
            )
        )
    )
) else (
    echo No .env file found. Skipping environment variable loading.
)
goto :eof

:: Android 환경 체크 함수
:check_android_env
echo Checking Android environment variables...
if not defined ANDROID_HOME (
    echo Error: ANDROID_HOME environment variable is not set.
    echo Please install Android Studio and set ANDROID_HOME in your environment.
    echo Example: set ANDROID_HOME=C:\Users\YourUser\AppData\Local\Android\Sdk
    exit /b 1
)

if not exist "%ANDROID_HOME%\platform-tools" (
    echo Error: Android SDK platform-tools not found at %ANDROID_HOME%\platform-tools.
    echo Please install platform-tools using Android Studio SDK Manager.
    exit /b 1
)

if not exist "%ANDROID_HOME%\build-tools" (
    echo Error: Android SDK build-tools not found at %ANDROID_HOME%\build-tools.
    echo Please install build-tools using Android Studio SDK Manager.
    exit /b 1
)
echo Android environment is set up correctly.
goto :eof

:: 빌드 전 환경 체크
call :check_versions
call :load_env

:: 필요한 모듈 설치
echo Installing dependencies...
call yarn install --immutable --check-cache
if errorlevel 1 (
    echo Error: Failed to install dependencies.
    exit /b 1
)

:: 환율 스냅샷 갱신
echo Updating fallback exchange rates...
call npx tsx scripts/fetch-fallback-rates.ts
if errorlevel 1 (
    echo Warning: Failed to update fallback rates. Using existing snapshot.
)

:: 빌드 디렉토리 생성
echo Creating build directory: %BUILD_DIR%
if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"

:: Windows 빌드 함수
:build_windows
echo Building Windows version...
call quasar build -m electron -T win32
if errorlevel 1 (
    echo Windows build failed
    exit /b 1
) else (
    echo Windows build completed. Moving artifacts...
    for %%f in ("dist\electron\Packaged\*.exe") do (
        move /Y "%%f" "%BUILD_DIR%\QCalc-%VERSION%-win.exe"
    )
    if exist "dist\electron\Packaged\latest.yml" (
        copy /Y "dist\electron\Packaged\latest.yml" "%BUILD_DIR%\latest.yml"
    )
)
goto :eof

:: Android 빌드 함수
:build_android
echo Building Android version...
call :check_android_env

call quasar build -m capacitor -T android
if errorlevel 1 (
    echo Android build failed
    exit /b 1
) else (
    echo Android build completed. Signing and moving APK...
    
    set "MY_JKS_KEY_FILE=!MY_JKS_KEY_FILE:="!"
    if not defined MY_JKS_KEY_FILE (
        set "MY_JKS_KEY_FILE=src-capacitor\android\app\my-release-key.jks"
    )

    if not exist "!MY_JKS_KEY_FILE!" (
        echo Warning: Keystore file not found at !MY_JKS_KEY_FILE!.
        echo Android app will be unsigned. To sign, provide MY_JKS_KEY_FILE in .env or ensure the default path is correct.
        for %%f in ("src-capacitor\android\app\build\outputs\apk\debug\app-debug.apk") do (
            if exist "%%f" (
                copy /Y "%%f" "%BUILD_DIR%\QCalc-%VERSION%-android-debug.apk"
            )
        )
    ) else (
        echo Building signed APK...
        pushd src-capacitor\android
        call gradlew assembleRelease
        popd
        copy /Y "src-capacitor\android\app\build\outputs\apk\release\app-release.apk" "%BUILD_DIR%\QCalc-%VERSION%-android.apk"
    )
)
goto :eof

:: 메인 실행 부분
set "BUILD_TYPE=%1"
if "%BUILD_TYPE%"=="" set "BUILD_TYPE=all"

if /i "%BUILD_TYPE%"=="all" (
    call :build_windows
    call :build_android
) else if /i "%BUILD_TYPE%"=="win" (
    call :build_windows
) else if /i "%BUILD_TYPE%"=="android" (
    call :build_android
) else (
    echo Invalid build type. Available options: all, win, android
    exit /b 1
)

echo Build process finished successfully!
echo You can find the build files in the %BUILD_DIR% directory.

endlocal