// ✅ 클릭 → 타겟 추가/제거// ✅ 클릭 → 타
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

// ✅ HUD 생성 + 추적 + 텍스트 표시
async function track() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const container = document.getElementById('hud-container')
    container.innerHTML = '' // 기존 HUD 초기화

    if (!data.targets) return

    data.targets.forEach((t) => {
      const hud = document.createElement('div')
      hud.className = 'hud'

      const x = (t.x / data.w) * window.innerWidth
      const y = (t.y / data.h) * window.innerHeight

      // ✅ 크기 비율 수정
      const base = Math.max(t.w, t.h)
      const size = Math.min(Math.max(base * 1.2, 60), 250)

      hud.style.left = x + 'px'
      hud.style.top = y + 'px'
      hud.style.width = size + 'px'
      hud.style.height = size + 'px'

      // ✅ HTML escape 제거된 버전
      hud.innerHTML = `
    <div class="ring big"></div>
    <div class="ring mid"></div>
    <div class="ring small"></div>
    <div class="cross"></div>

    <div class="label">
      <div class="name">${t.name}</div>
      <div class="status">TRACKING</div>
    </div>
  `

      container.appendChild(hud)
    })
  } catch (e) {
    console.log('error:', e)
  }
}

// ✅ 반복 실행 (HUD 계속 업데이트)
setInterval(track, 30)
