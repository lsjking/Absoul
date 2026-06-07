async function trackEye() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const hud = document.getElementById('hud')

    // ✅ 항상 타겟 중심 사용 (눈 없음)
    const x = (data.tx / data.w) * window.innerWidth
    const y = (data.ty / data.h) * window.innerHeight

    hud.style.left = x + 'px'
    hud.style.top = y + 'px'

    // ✅ 타겟 표시
    if (data.target) {
      hud.style.transform = 'translate(-50%, -50%) scale(1.4)'
      hud.style.boxShadow = '0 0 40px red'
    } else {
      hud.style.transform = 'translate(-50%, -50%) scale(1)'
      hud.style.boxShadow = '0 0 20px orange'
    }
  } catch (e) {
    console.log('error:', e)
  }
}

setInterval(trackEye, 30)
