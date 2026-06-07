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
    "tx": 0,
    "ty": 0,
    "w": 640,
    "h": 480,
    "target": None
}

click_target = None
last_boxes = []

# ✅ 박스 비교 (오차 허용)
def is_same_box(box1, box2):
    if not box1 or not box2:
        return False

    x1,y1,x2,y2,_ = box1
    a1,b1,a2,b2,_ = box2

    return abs(x1-a1)<30 and abs(y1-b1)<30


# ✅ 클릭 → 선택 / 변경 / 해제
@app.route("/click", methods=["POST"])
def click():
    global click_target, last_boxes

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

    # ✅ 토글 (오차 허용 비교)
    if is_same_box(click_target, selected_box):
        click_target = None
    else:
        click_target = selected_box

    return "ok"


# ✅ ESC → 강제 해제
@app.route("/clear", methods=["POST"])
def clear():
    global click_target
    click_target = None
    return "ok"


def generate():
    global eye_data, click_target, last_boxes

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        h, w, _ = frame.shape
        eye_data["w"] = w
        eye_data["h"] = h

        results = model(frame)[0]

        last_boxes = []

        # ✅ YOLO 탐지
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls = int(box.cls[0])
            name = model.names[cls]

            # 👉 필요하면 사용
            if name == "person":
                continue

            last_boxes.append((x1, y1, x2, y2, name))

            # 파란 박스
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 100, 100), 2)
            cv2.putText(frame, name, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 100, 100), 2)

        # ✅ 선택된 타겟
        if click_target:
            x1, y1, x2, y2, name = click_target

            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2

            eye_data["tx"] = cx
            eye_data["ty"] = cy
            eye_data["target"] = name

            # 🔴 빨간 박스
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)

        else:
            eye_data["target"] = None

        # ✅ 고화질
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]
        _, buffer = cv2.imencode(".jpg", frame, encode_param)

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" +
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