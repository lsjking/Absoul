from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

cap = cv2.VideoCapture(0)

# ✅ YOLO 모델
model = YOLO("yolov8n.pt")

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True
)

eye_data = {
    "x": 0,
    "y": 0,
    "target": None
}

def generate():
    global eye_data

    while True:
        success, frame = cap.read()
        if not success:
            continue

        h, w, _ = frame.shape

        # ✅ YOLO 객체 인식
        results = model(frame)[0]

        # ✅ 얼굴 인식
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face = face_mesh.process(rgb)

        gaze_x, gaze_y = 0, 0

        if face.multi_face_landmarks:
            landmarks = face.multi_face_landmarks[0].landmark

            # ✅ 눈 + 얼굴 방향
            iris = landmarks[468]
            left_eye = landmarks[33]
            right_eye = landmarks[263]
            nose = landmarks[1]

            cx = int(iris.x * w)
            cy = int(iris.y * h)

            eye_center_x = (left_eye.x + right_eye.x) / 2
            eye_center_y = (left_eye.y + right_eye.y) / 2

            dx = (iris.x - eye_center_x) + (nose.x - 0.5)
            dy = (iris.y - eye_center_y) + (nose.y - 0.5)

            dx *= 4
            dy *= 4

            # ✅ 시선 위치
            gaze_x = int(cx + dx * 800)
            gaze_y = int(cy + dy * 800)

            eye_data["x"] = gaze_x
            eye_data["y"] = gaze_y

            # ✅ 표시
            cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)
            cv2.circle(frame, (gaze_x, gaze_y), 6, (0, 200, 255), -1)

        target_name = None

        # ✅ 객체 + 시선 충돌
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls_id = int(box.cls[0])
            name = model.names[cls_id]

            # 기본 박스
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255,100,100), 2)
            cv2.putText(frame, name, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,100,100), 2)

            # 🔥 LOCK
            if x1 < gaze_x < x2 and y1 < gaze_y < y2:
                target_name = name

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,255), 3)
                cv2.putText(frame, "LOCK", (x1, y2 + 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,255), 2)

        eye_data["target"] = target_name

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


@app.route('/video')
def video():
    return Response(generate(),
        mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/eye')
def eye():
    return jsonify(eye_data)


if __name__ == "__main__":
    app.run(port=5000)