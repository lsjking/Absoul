from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp

app = Flask(__name__)
CORS(app)

cap = cv2.VideoCapture(0)

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True
)

eye_data = {
    "x": 0,
    "y": 0,
    "dx": 0,
    "dy": 0
}

def generate():
    global eye_data

    while True:
        success, frame = cap.read()
        if not success:
            continue

        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = face_mesh.process(rgb)

        if result.multi_face_landmarks:
            landmarks = result.multi_face_landmarks[0].landmark

            # ✅ 홍채 중심 (눈 위치)
            iris = landmarks[468]

            # ✅ 눈 양쪽 끝
            left_eye = landmarks[33]
            right_eye = landmarks[263]

            # ✅ 얼굴 방향 (코)
            nose = landmarks[1]

            # ✅ 픽셀 좌표
            cx = int(iris.x * w)
            cy = int(iris.y * h)

            # ✅ 눈 중심
            eye_center_x = (left_eye.x + right_eye.x) / 2
            eye_center_y = (left_eye.y + right_eye.y) / 2

            # ✅ 시선 = 눈 움직임 + 얼굴 방향
            dx_eye = iris.x - eye_center_x
            dy_eye = iris.y - eye_center_y

            dx_head = nose.x - 0.5
            dy_head = nose.y - 0.5

            dx = (dx_eye + dx_head) * 4
            dy = (dy_eye + dy_head) * 4

            eye_data["x"] = cx
            eye_data["y"] = cy
            eye_data["dx"] = dx
            eye_data["dy"] = dy

            # ✅ 시선 끝점
            end_x = int(cx + dx * 800)
            end_y = int(cy + dy * 800)

            # ✅ 디버그 표시
            cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)
            cv2.circle(frame, (end_x, end_y), 6, (0, 200, 255), -1)

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