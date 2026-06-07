from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# ✅ 카메라 열기
cap = cv2.VideoCapture(0)

# ✅ 🔥 해상도 설정 (핵심)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
# 더 좋으면 이걸로:
# cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
# cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

model = YOLO("yolov8n.pt")

eye_data = {
    "tx": 0,
    "ty": 0,
    "w": 640,
    "h": 480,
    "target": None
}

def generate():
    global eye_data

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        h, w, _ = frame.shape
        results = model(frame)[0]

        best_center = (0, 0)
        best_name = None
        max_area = 0

        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls_id = int(box.cls[0])
            name = model.names[cls_id]

            # ✅ 사람 제거 원하면 켜기
            if name == "person":
                continue

            area = (x2 - x1) * (y2 - y1)

            if area > max_area:
                max_area = area
                best_center = ((x1 + x2)//2, (y1 + y2)//2)
                best_name = name

            # ✅ 박스 표시
            cv2.rectangle(frame, (x1,y1), (x2,y2), (255,100,100), 2)
            cv2.putText(frame, name, (x1, y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,100,100), 2)

        if best_name:
            eye_data["tx"] = best_center[0]
            eye_data["ty"] = best_center[1]
            eye_data["target"] = best_name

        eye_data["w"] = w
        eye_data["h"] = h

        # ✅ 🔥 JPEG 품질 설정 (핵심)
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]
        _, buffer = cv2.imencode('.jpg', frame, encode_param)

        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' +
               frame_bytes + b'\r\n')


@app.route('/video')
def video():
    return Response(generate(),
        mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/eye')
def eye():
    return jsonify(eye_data)


if __name__ == "__main__":
    app.run(port=5000)