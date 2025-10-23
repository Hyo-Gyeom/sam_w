
# 심심풀이 삼국지 무장 전투력 계산기

머신러닝 기반 삼국지 무장 전투력 계산 시스템

## 🚀 기능

- **무장 정보 입력**: 기본 스탯, 레벨업 스탯, 장비, 스킬 등
- **머신러닝 학습**: 더미 데이터를 통한 패턴 학습
- **전투력 계산**: RandomForest 기반 전투력 예측
- **데이터 저장**: SQLite 데이터베이스 저장
- **무장 관리**: 저장된 무장 목록 조회/삭제

## 📁 파일 구조

```
samw/
├── app.py                 # Flask 웹 서버 (메인)
├── calculate_power.py     # 머신러닝 계산 엔진
├── main.html             # 메인 계산 페이지
├── main.css              # 메인 페이지 스타일
├── main.js               # 메인 페이지 로직
├── calculator.html       # 더미 데이터 입력 페이지
├── calculator.js         # 더미 데이터 입력 로직
├── list.html             # 저장된 무장 목록 페이지
├── list.js               # 목록 페이지 로직
├── requirements.txt      # Python 의존성
├── generals.db          # SQLite 데이터베이스
└── README.md            # 프로젝트 설명
```

## 🛠️ 설치 및 실행

### 🚀 간단 실행 (추천)
**Windows:**
```bash
run.bat
```
- 자동으로 브라우저가 열립니다
- 서버 중지: 창을 닫거나 Ctrl+C

**Linux/Mac:**
```bash
./run.sh
```
- 자동으로 브라우저가 열립니다
- 서버 중지: Ctrl+C

### 📋 수동 실행
1. **의존성 설치**
   ```bash
   pip install -r requirements.txt
   ```

2. **서버 실행**
   ```bash
   python app.py
   ```

3. **웹 브라우저 접속**
   - **메인 페이지**: http://localhost:5000
   - **더미 입력**: http://localhost:5000/calculator
   - **무장 목록**: http://localhost:5000/list

## 🧠 머신러닝 기능

### 학습 데이터
- 더미 데이터 입력 시 실제 전투력과 함께 저장
- RandomForest 알고리즘으로 패턴 학습
- 특성 중요도 분석 제공

### 계산 요소
- **레벨**: 기본 전투력 + 레벨 보너스
- **등급**: 무장 등급별 보너스
- **스탯**: 통무지정매 스탯의 전투력 기여도
- **장비**: 장비 등급별 전투력
- **스킬**: 보유 스킬 개수별 전투력

## 📊 데이터베이스

### generals 테이블
- `id`: 자동 증가 기본키
- `name`: 무장 이름
- `grade`: 무장 등급
- `level`: 레벨
- `power`: 전투력
- `base_stats`: 기본 스탯 (JSON)
- `levelup_stats`: 레벨업 스탯 (JSON)
- `add_stats`: 추가 스탯 (JSON)
- `skills`: 스킬 (JSON)
- `equipment`: 장비 (JSON)
- `saved_at`: 저장 시간

## 🔧 API 엔드포인트

- `GET /api/generals` - 모든 무장 조회
- `GET /api/generals/{id}` - 특정 무장 조회
- `POST /api/generals` - 무장 저장
- `PUT /api/generals/{id}` - 무장 수정
- `DELETE /api/generals/{id}` - 무장 삭제
- `DELETE /api/generals` - 모든 무장 삭제
- `POST /api/calculate-power` - 전투력 계산

## 🎯 사용법

1. **더미 데이터 입력**: `/calculator`에서 무장 정보와 실제 전투력 입력
2. **학습 진행**: 더미 데이터가 쌓일수록 예측 정확도 향상
3. **전투력 계산**: `/`에서 무장 정보 입력 후 전투력 계산
4. **무장 관리**: `/list`에서 저장된 무장 조회/삭제

## 🚀 기술 스택

- **Backend**: Python Flask
- **Database**: SQLite3
- **Machine Learning**: scikit-learn, RandomForest
- **Frontend**: HTML, CSS, JavaScript
- **Data Processing**: pandas, numpy
