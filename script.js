// ✅ 클릭 함수
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

// ✅ 클릭 이벤트 등록
document.body.addEventListener('click', setTarget)

// ✅ ESC → 타겟 해제
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    fetch('http://127.0.0.1:5000/clear', {
      method: 'POST',
    })
  }
})

// ✅ HUD 이동 함수
async function track() {
  try {
    const res = await fetch('http://127.0.0.1:5000/eye')
    const data = await res.json()

    const hud = document.getElementById('hud')

    const x = (data.tx / data.w) * window.innerWidth
    const y = (data.ty / data.h) * window.innerHeight

    hud.style.left = x + 'px'
    hud.style.top = y + 'px'

    if (data.target) {
      hud.style.transform = 'translate(-50%, -50%) scale(1.5)'
      hud.style.boxShadow = '0 0 50px red'
    } else {
      hud.style.transform = 'translate(-50%, -50%) scale(1)'
      hud.style.boxShadow = '0 0 20px orange'
    }
  } catch (e) {
    console.log('error:', e)
  }
}

// ✅ 반복 실행
setInterval(track, 30)
