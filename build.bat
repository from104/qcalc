@echo off
setlocal enabledelayedexpansion

:: Node.js와 Yarn 설치 여부 및 버전 체크
echo Checking Node.js and Yarn installation...

:: Node.js 설치 확인
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js version 20 or higher
    exit /b 1
)

:: Yarn 설치 확인
where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Yarn is not installed
    echo Please install Yarn version 4.0.0 or higher
    exit /b 1
)

:: Node.js 버전 체크
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_MAJOR=%%a
    set NODE_MAJOR=!NODE_MAJOR:~1!
)
if !NODE_MAJOR! LSS 20 (
    echo Error: Node.js version 20 or higher is required
    echo Current version: !NODE_MAJOR!
    exit /b 1
)

:: Yarn 버전 체크
for /f "tokens=1,2,3 delims=." %%a in ('yarn -v') do (
    set YARN_MAJOR=%%a
    if %%a LSS 4 (
        echo Error: Yarn version 4.0.0 or higher is required
        echo Current version: %%a.%%b.%%c
        exit /b 1
    )
)
echo Version check passed

:: 버전 정보 추출
for /f "tokens=2 delims=:, " %%a in ('findstr "version" package.json') do (
    set VERSION=%%~a
    set VERSION=!VERSION:"=!
)
echo Building version %VERSION%...

:: 빌드 디렉토리 생성
set BUILD_DIR=.\package
if not exist %BUILD_DIR% mkdir %BUILD_DIR%

:: 필요한 모듈 설치
echo Installing dependencies...
call yarn install

:: Android 환경 체크 함수
:check_android_env
if not defined ANDROID_HOME (
    echo Error: ANDROID_HOME environment variable is not set
    echo Please install Android Studio and set ANDROID_HOME in your environment
    echo Example: set ANDROID_HOME=C:\Users\YourUser\AppData\Local\Android\Sdk
    exit /b 1
)

if not exist "%ANDROID_HOME%\platform-tools" (
    echo Error: Android SDK platform-tools not found
    echo Please install platform-tools using Android Studio SDK Manager
    exit /b 1
)

if not exist "%ANDROID_HOME%\build-tools" (
    echo Error: Android SDK build-tools not found
    echo Please install build-tools using Android Studio SDK Manager
    exit /b 1
)
goto :eof

:: Windows 빌드 함수
:build_windows
echo Building Windows version...
call quasar build -m electron -T win32
if errorlevel 1 (
    echo Windows build failed
    exit /b 1
) else (
    echo Windows build completed successfully
    move /Y dist\electron\Packaged\*.exe "%BUILD_DIR%\QCalc-%VERSION%-win32.exe"
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
    echo Android build completed successfully
    
    set KEYSTORE_PATH=src-capacitor\android\app\my-release-key.jks
    if not exist "!KEYSTORE_PATH!" (
        echo Warning: Keystore file not found at !KEYSTORE_PATH!
        echo Android app will be unsigned
    ) else (
        echo Building signed APK...
        cd src-capacitor\android
        call gradlew assembleRelease
        cd ..\..
        copy /Y src-capacitor\android\app\build\outputs\apk\release\app-release.apk "%BUILD_DIR%\QCalc-%VERSION%-android.apk"
    )
)
goto :eof

:: 메인 실행 부분
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=all

if "%BUILD_TYPE%"=="all" (
    call :build_windows
    call :build_android
) else if "%BUILD_TYPE%"=="win" (
    call :build_windows
) else if "%BUILD_TYPE%"=="android" (
    call :build_android
) else (
    echo Invalid build type. Available options: all, win, android
    exit /b 1
)

echo Build completed!
echo You can find the build files in the %BUILD_DIR% directory

endlocal 