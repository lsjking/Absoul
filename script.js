// ✅ 클릭
function setTarget(e) {
  fetch('http://127.0.0.1:5000/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      x: e.clientX,
      y: e.clientY,
      w: window.innerWidth,
      h: window.innerHeight,
    }),
  })
}

document.body.addEventListener('click', setTarget)

// ✅ ESC
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    fetch('http://127.0.0.1:5000/clear', { method: 'POST' })
  }
})

// ✅ HUD 여러 개 생성
async function track() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const container = document.getElementById('hud-container')
    container.innerHTML = ''

    data.targets.forEach((t) => {
      const hud = document.createElement('div')
      hud.className = 'hud'

      const x = (t.x / data.w) * window.innerWidth
      const y = (t.y / data.h) * window.innerHeight

      const size = Math.max(t.w, t.h)

      hud.style.left = x + 'px'
      hud.style.top = y + 'px'
      hud.style.width = size + 'px'
      hud.style.height = size + 'px'

      hud.innerHTML = `
        <div class="ring big"></div>
        <div class="ring mid"></div>
        <div class="ring small"></div>
        <div class="cross"></div>
      `

      container.appendChild(hud)
    })
  } catch (e) {
    console.log(e)
  }
}

setInterval(track, 30)
