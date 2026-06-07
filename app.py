from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# ✅ 카메라
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# ✅ 모델
model = YOLO("yolov8n.pt")

# ✅ HUD 데이터
eye_data = {
    "targets": [],
    "w": 640,
    "h": 480
}

click_targets = []   # ✅ 여러 개 저장
last_boxes = []


# ✅ 박스 비교 (오차 허용)
def is_same_box(a, b):
    if not a or not b:
        return False

    x1,y1,x2,y2,_ = a
    a1,b1,a2,b2,_ = b

    return abs(x1-a1) < 30 and abs(y1-b1) < 30


# ✅ 클릭
@app.route("/click", methods=["POST"])
def click():
    global click_targets, last_boxes

    data = request.json

    cx = int((data["x"] / data["w"]) * eye_data["w"])
    cy = int((data["y"] / data["h"]) * eye_data["h"])

    min_dist = 999999
    selected_box = None

    for box in last_boxes:
        x1, y1, x2, y2, name = box
        bx = (x1 + x2) // 2
        by = (y1 + y2) // 2

        dist = (bx - cx) ** 2 + (by - cy) ** 2

        if dist < min_dist:
            min_dist = dist
            selected_box = box

    # ✅ 토글
    found = False
    for t in click_targets:
        if is_same_box(t, selected_box):
            click_targets.remove(t)
            found = True
            break

    if not found and selected_box:
        click_targets.append(selected_box)

    return "ok"


# ✅ ESC → 전체 제거
@app.route("/clear", methods=["POST"])
def clear():
    global click_targets
    click_targets = []
    return "ok"


def generate():
    global eye_data, click_targets, last_boxes

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        h, w, _ = frame.shape
        eye_data["w"] = w
        eye_data["h"] = h

        results = model(frame)[0]
        last_boxes = []

        # ✅ YOLO 객체 탐지
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls = int(box.cls[0])
            name = model.names[cls]

            # 사람 제거 (원하면 주석 처리)
            if name == "person":
                continue

            last_boxes.append((x1, y1, x2, y2, name))

            # 파란 박스
            cv2.rectangle(frame, (x1,y1), (x2,y2), (255,100,100), 2)
            cv2.putText(frame, name, (x1, y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,100,100), 2)

        # ✅ ✅ ✅ 🔥 핵심: 추적 로직
        eye_data["targets"] = []
        new_targets = []

        for target in click_targets:
            best_match = None
            min_dist = 999999

            tx1, ty1, tx2, ty2, tname = target
            t_cx = (tx1 + tx2) // 2
            t_cy = (ty1 + ty2) // 2

            # 현재 프레임에서 같은 객체 다시 찾기
            for box in last_boxes:
                x1, y1, x2, y2, name = box

                if name != tname:
                    continue

                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2

                dist = (cx - t_cx)**2 + (cy - t_cy)**2

                if dist < min_dist:
                    min_dist = dist
                    best_match = box

            # 찾으면 추적
            if best_match:
                x1, y1, x2, y2, name = best_match

                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2
                bw = x2 - x1
                bh = y2 - y1

                eye_data["targets"].append({
                    "x": cx,
                    "y": cy,
                    "w": bw,
                    "h": bh,
                    "name": name
                })

                # 🔴 빨간 박스
                cv2.rectangle(frame, (x1,y1), (x2,y2), (0,0,255), 3)

                new_targets.append(best_match)

        # ✅ 다음 프레임용 업데이트
        click_targets = new_targets

        # ✅ 고화질 인코딩
        _, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])

        yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" +
               buffer.tobytes() + b"\r\n")


@app.route("/video")
def video():
    return Response(generate(),
        mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route("/eye")
def eye():
    return jsonify(eye_data)


if __name__ == "__main__":
    app.run(port=5000)