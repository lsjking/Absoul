# 🎯 AI Target Tracking HUD

## 📌 Project Overview

이 프로젝트는 AI 이미지 인식 기술을 기반으로  
실시간 영상에서 객체(타겟)를 추적하고  
웹에서 HUD 형태로 시각화하는 시스템입니다.

Python(OpenCV) 기반 백엔드에서 처리된 데이터를  
JavaScript 프론트엔드에서 받아와

👉 사용자 클릭 기반 타겟 지정  
👉 실시간 위치 추적  
👉 LOCKED 상태 시각화

를 구현했습니다.

---

## ⚙️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python (Flask)
- Computer Vision: OpenCV
- Communication: REST API (Fetch)

---

## 🚀 Features

- 📌 Click-based target selection  
  → 사용자가 클릭한 위치를 타겟으로 설정

- 🎯 Real-time tracking HUD  
  → 서버 데이터를 기반으로 HUD 오버레이 표시

- 🔴 Target state visualization  
  → NORMAL / LOCKED 상태에 따라 색상 변경

- ⌨️ ESC key control  
  → 모든 타겟 초기화

- 🔄 Live update (30ms interval)  
  → 실시간 데이터 반영 및 HUD 갱신

---

## 🔄 How It Works

1. 사용자가 화면을 클릭하면 좌표가 서버로 전달됨
2. 서버는 이미지 인식을 통해 타겟을 추적
3. `/eye` API를 통해 타겟 정보를 반환
4. 프론트엔드는 데이터를 받아 HUD 생성
5. 30ms 간격으로 반복 실행하여 실시간 효과 구현

---

## 📚 Implementation Details

### 1. 사용자 입력 처리

- `addEventListener`를 사용하여 클릭 이벤트 감지
- 클릭 시 `setTarget` 함수가 실행되어 좌표를 서버에 전달
- 서버는 해당 위치에 타겟을 추가

- ESC 키 입력 시 `/clear` API 호출  
  👉 모든 타겟 제거

---

### 2. 실시간 데이터 처리

- `setInterval(track, 30)`을 통해 30ms마다 반복 실행
- `/eye` API를 통해 타겟 정보를 지속적으로 받아옴
- 데이터를 기반으로 HUD를 동적으로 렌더링

---

### 3. HUD 렌더링

- 서버 좌표를 화면 크기에 맞게 변환하여 위치 계산
- 타겟 크기(`w`, `h`)를 기반으로 HUD 크기 자동 조정
- 최소 / 최대 크기 제한을 통해 화면 안정성 유지

---

### 4. 상태 기반 UI 변경

- 타겟 상태(`state`)에 따라 색상 변경
  - 일반 상태 → 주황색
  - LOCKED 상태 → 빨간색

👉 상태를 직관적으로 시각화

---

## 💡 Description

이 프로젝트는 단순한 UI 구현이 아닌  
AI 기반 이미지 인식 결과를 웹에 실시간으로 반영하는 구조를 설계하고 구현했습니다.

특히,

- 영상 스트림 처리
- 사용자 인터랙션
- 서버-클라이언트 통신
- 실시간 렌더링

을 통합하여  
아이언맨 HUD 스타일의 인터페이스를 구현한 것이 핵심입니다.
