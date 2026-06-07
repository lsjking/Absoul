async function trackEye() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const hud = document.getElementById('hud')

    // ✅ 눈 위치 → 화면 변환
    const x = (data.x / 640) * window.innerWidth
    const y = (data.y / 480) * window.innerHeight

    // ✅ 시선 방향 이동
    const targetX = x + data.dx * 1200
    const targetY = y + data.dy * 1200

    // ✅ HUD 이동
    hud.style.left = targetX + 'px'
    hud.style.top = targetY + 'px'

    // ✅ 3D 효과
    hud.style.transform = `
      translate(-50%, -50%)
      rotateY(${data.dx * 50}deg)
      rotateX(${data.dy * -50}deg)
      scale(1.2)
    `
  } catch (e) {
    console.log('error')
  }
}

setInterval(trackEye, 30)
