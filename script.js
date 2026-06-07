async function trackEye() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const eye = document.getElementById('eye')

    // ✅ 좌표 보정
    const x = (data.x / 640) * window.innerWidth
    const y = (data.y / 480) * window.innerHeight

    eye.style.left = x + 'px'
    eye.style.top = y + 'px'
  } catch (e) {
    console.log('error')
  }
}

setInterval(trackEye, 30)
