# 🎯 AI Target Tracking HUD

## 📌 Overview

AI 이미지 인식을 활용해 영상 속 타겟을 추적하고  
웹에서 HUD 형태로 시각화하는 시스템입니다.

---

## ⚙️ Tech

- HTML, CSS, JavaScript
- Python (Flask)
- OpenCV

---

## 🚀 Features

- 클릭으로 타겟 선택 및 삭제
- 실시간 HUD 표시 (30ms)
- LOCKED 상태 색상 변경
- ESC 키로 전체 초기화

---

## 🧠 JavaScript Implementation

### 📌 HUD 시스템

- `addEventListener`를 사용해 클릭 시 좌표를 서버로 전송 (타겟 생성)
- `setInterval`을 이용해 30ms마다 데이터를 받아 HUD 갱신
- DOM 조작으로 HUD 요소 동적 생성
- 상태(state)에 따라 색상 변경 (LOCKED → 빨강)

---

### 📌 페이지 인터랙션 (home.js)

- `IntersectionObserver`로 스크롤 기반 애니메이션 구현
- 카드가 화면에 들어오면 순차적으로 등장, 벗어나면 제거
- 검색 기능 → 입력값 기준 섹션 필터링
- 초기화 버튼 → 검색 상태 리셋
- TOP 버튼 → 스크롤 위치 기반 표시 + 부드러운 이동

---

### 📌 삼각함수 시각화 (sam.js)

- 슬라이더와 입력창을 동기화하여 각도 입력 처리
- `Math.sin`, `cos`, `tan`을 사용한 실시간 계산
- Canvas를 활용해 단위원(원)과 그래프 직접 렌더링
- sin, cos, tan 값을 좌표 및 그래프로 시각화
- tan 그래프는 급격한 변화 구간을 끊어서 자연스럽게 표현

---

## 🔄 Flow

클릭 → 서버로 좌표 전송 → AI가 타겟 추적 →  
데이터 반환 → HUD로 실시간 표시
