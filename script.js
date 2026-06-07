async function trackEye() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const hud = document.getElementById('hud')

    // ✅ 시선 좌표
    const x = (data.x / 640) * window.innerWidth
    const y = (data.y / 480) * window.innerHeight

    // ✅ HUD 이동
    hud.style.left = x + 'px'
    hud.style.top = y + 'px'

    // ✅ LOCK UI
    if (data.target) {
      hud.style.border = '3px solid red'
    } else {
      hud.style.border = 'none'
    }
  } catch (e) {
    console.log('error')
  }
}

setInterval(trackEye, 30)
