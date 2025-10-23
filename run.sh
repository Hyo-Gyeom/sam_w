#!/bin/bash

echo "삼국지 무장 전투력 계산기 시작 중..."
echo

# Python이 설치되어 있는지 확인
if ! command -v python3 &> /dev/null; then
    echo "Python3이 설치되어 있지 않습니다."
    echo "Python을 설치해주세요: https://www.python.org/downloads/"
    exit 1
fi

# 의존성 설치
echo "의존성 패키지 설치 중..."
pip3 install -r requirements.txt

echo
echo "서버를 시작합니다..."
echo
echo "접속 주소:"
echo "- 메인 페이지: http://localhost:5000"
echo "- 데이터 입력: http://localhost:5000/data-input"
echo "- 무장 목록: http://localhost:5000/list"
echo
echo "서버를 중지하려면 Ctrl+C를 누르세요."
echo

# Flask 서버 실행 (백그라운드)
python3 app.py &
SERVER_PID=$!

# 잠시 대기 후 브라우저 열기
sleep 3

# 브라우저 열기 (OS별)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5000
elif command -v open &> /dev/null; then
    open http://localhost:5000
else
    echo "브라우저를 수동으로 열어주세요: http://localhost:5000"
fi

echo
echo "브라우저가 자동으로 열렸습니다."
echo "서버를 중지하려면 Ctrl+C를 누르세요."
echo

# 서버가 종료될 때까지 대기
wait $SERVER_PID
