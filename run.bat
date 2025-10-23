@echo off
chcp 65001 >nul
echo 삼국지 무장 전투력 계산기 시작 중...
echo.

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if errorlevel 1 (
    echo Python이 설치되어 있지 않습니다.
    echo Python을 설치해주세요: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 의존성 설치 확인
echo 의존성 패키지 설치 중...
pip install -r requirements.txt

echo.
echo 서버를 시작합니다...
echo.
echo 접속 주소:
echo - 메인 페이지: http://localhost:5000
echo - 데이터 입력: http://localhost:5000/data-input  
echo - 무장 목록: http://localhost:5000/list
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo.

REM Flask 서버 실행 (백그라운드)
start /b python app.py

REM 잠시 대기 후 브라우저 열기
timeout /t 3 /nobreak >nul
start http://localhost:5000

echo.
echo 브라우저가 자동으로 열렸습니다.
echo 서버를 중지하려면 이 창을 닫으세요.
echo.

REM 서버가 종료될 때까지 대기
echo 서버가 실행 중입니다. 창을 닫으면 서버가 중지됩니다.
pause
