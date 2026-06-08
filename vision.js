const img = document.getElementById('video')

const streamUrl = 'http://127.0.0.1:5000/video'
const fallbackUrl = 'fallback.jpg'

// ✅ 서버 꺼졌을 때 자동 fallback
img.onerror = () => {
  img.src = fallbackUrl
}

// ✅ 처음 실행
img.src = streamUrl
// ✅ 클릭 → 타겟 추가/제거
function setTarget(e) {
  fetch('http://127.0.0.1:5000/click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      x: e.clientX,
      y: e.clientY,
      w: window.innerWidth,
      h: window.innerHeight,
    }),
  })
}

document.body.addEventListener('click', setTarget)

// ✅ ESC → 전체 해제
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    fetch('http://127.0.0.1:5000/clear', {
      method: 'POST',
    })
  }
})

// ✅ HUD 생성 + 상태 반영 + 색상 변경
async function track() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const container = document.getElementById('hud-container')
    container.innerHTML = ''

    if (!data.targets) return

    data.targets.forEach((t) => {
      const hud = document.createElement('div')
      hud.className = 'hud'

      const x = (t.x / data.w) * window.innerWidth
      const y = (t.y / data.h) * window.innerHeight

      // ✅ 크기 보정
      const base = Math.max(t.w, t.h)
      const size = Math.min(Math.max(base * 1.2, 60), 250)

      hud.style.left = x + 'px'
      hud.style.top = y + 'px'
      hud.style.width = size + 'px'
      hud.style.height = size + 'px'

      // ✅ 🔥 상태별 색상
      const isLocked = t.state === 'LOCKED'
      const ringColor = isLocked ? 'red' : 'orange'
      const textColor = isLocked ? 'red' : '#00ff99'

      // ✅ 🔥 HTML 정상 (escape 제거)
      hud.innerHTML = `
        <div class="ring big" style="border-color:${ringColor}; box-shadow:0 0 20px ${ringColor}"></div>
        <div class="ring mid" style="border-color:${ringColor}; box-shadow:0 0 20px ${ringColor}"></div>
        <div class="ring small" style="border-color:${ringColor}; box-shadow:0 0 20px ${ringColor}"></div>
        <div class="cross"></div>

        <div class="label">
          <div class="name">${t.name}</div>
          <div class="status" style="color:${textColor}">
            ${t.state}
          </div>
        </div>
      `

      container.appendChild(hud)
    })
  } catch (e) {
    console.log('error:', e)
  }
}

// ✅ 반복 실행
setInterval(track, 30)
