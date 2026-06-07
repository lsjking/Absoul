async function trackEye() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const eye = document.getElementById('eye')
    const hud = document.getElementById('hud')

    const x = (data.x / 640) * window.innerWidth
    const y = (data.y / 480) * window.innerHeight

    eye.style.left = x + 'px'
    eye.style.top = y + 'px'

    hud.style.left = x + 'px'
    hud.style.top = y + 'px'

    // ✅ 🔥 3D 효과 핵심
    const dx = data.x / 640 - 0.5
    const dy = data.y / 480 - 0.5

    hud.style.transform = `
      translate(-50%, -50%)
      rotateY(${dx * 30}deg)
      rotateX(${dy * -30}deg)
    `
  } catch (e) {
    console.log('error')
  }
}

setInterval(trackEye, 30)
