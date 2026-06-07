from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp

app = Flask(__name__)
CORS(app)

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("❌ 카메라 열기 실패")
else:
    print("✅ 카메라 연결 성공")

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True
)

eye_pos = {"x": 0, "y": 0}

def generate():
    global eye_pos

    while True:
        try:
            success, frame = cap.read()
            if not success:
                continue

            h, w, _ = frame.shape

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = face_mesh.process(rgb)

            if result.multi_face_landmarks:
                landmarks = result.multi_face_landmarks[0].landmark

                eye = landmarks[468]

                eye_pos["x"] = int(eye.x * w)
                eye_pos["y"] = int(eye.y * h)

            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        except Exception as e:
            print("🚨 에러:", e)
            continue


@app.route('/video')
def video():
    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/eye')
def eye():
    return jsonify(eye_pos)


if __name__ == "__main__":
    app.run(port=5000)