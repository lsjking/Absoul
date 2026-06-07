const angleInput = document.getElementById('angle')
const angleValue = document.getElementById('angleValue')
const angleBox = document.getElementById('angleInputBox')
const result = document.getElementById('result')

// 캔버스
const circleCanvas = document.getElementById('circle')
const circleCtx = circleCanvas.getContext('2d')

const graphCanvas = document.getElementById('graph')
const graphCtx = graphCanvas.getContext('2d')

// ✅ 슬라이더 → 입력창
angleInput.addEventListener('input', () => {
  angleBox.value = angleInput.value
  update()
})

// ✅ 입력창 → 슬라이더 (실시간)
angleBox.addEventListener('change', () => {
  let val = angleBox.value

  if (val > 360) val = 360
  if (val < 0) val = 0

  angleInput.value = val
  update()
})

function update() {
  const angle = angleInput.value

  angleValue.innerText = angle + '°'
  angleBox.value = angle

  const rad = (angle * Math.PI) / 180

  const sin = Math.sin(rad)
  const cos = Math.cos(rad)
  let tan = Math.tan(rad)

  if (Math.abs(tan) > 1000) tan = '∞'
  else tan = tan.toFixed(3)

  result.innerText = `sin: ${sin.toFixed(3)} | cos: ${cos.toFixed(3)} | tan: ${tan}`

  drawCircle(angle, sin, cos)
  drawGraph(angle)
}

// ✅ 단위원
function drawCircle(angle, sin, cos) {
  const cx = 150
  const cy = 150
  const r = 100

  circleCtx.clearRect(0, 0, 300, 300)

  // 원
  circleCtx.beginPath()
  circleCtx.arc(cx, cy, r, 0, Math.PI * 2)
  circleCtx.strokeStyle = 'white'
  circleCtx.stroke()

  // x축
  circleCtx.beginPath()
  circleCtx.moveTo(0, cy)
  circleCtx.lineTo(300, cy)
  circleCtx.strokeStyle = 'gray'
  circleCtx.stroke()

  // y축
  circleCtx.beginPath()
  circleCtx.moveTo(cx, 0)
  circleCtx.lineTo(cx, 300)
  circleCtx.stroke()

  const x = cx + cos * r
  const y = cy - sin * r

  // 반지름
  circleCtx.beginPath()
  circleCtx.moveTo(cx, cy)
  circleCtx.lineTo(x, y)
  circleCtx.strokeStyle = '#38bdf8'
  circleCtx.stroke()

  // 점
  circleCtx.beginPath()
  circleCtx.arc(x, y, 5, 0, Math.PI * 2)
  circleCtx.fillStyle = 'red'
  circleCtx.fill()

  // sin
  circleCtx.beginPath()
  circleCtx.moveTo(x, cy)
  circleCtx.lineTo(x, y)
  circleCtx.strokeStyle = '#22c55e'
  circleCtx.stroke()

  // cos
  circleCtx.beginPath()
  circleCtx.moveTo(cx, cy)
  circleCtx.lineTo(x, cy)
  circleCtx.strokeStyle = '#f43f5e'
  circleCtx.stroke()

  // 각도 표시
  circleCtx.fillStyle = 'white'
  circleCtx.font = '12px sans-serif'
  circleCtx.fillText('0°', cx + r + 10, cy + 5)
  circleCtx.fillText('90°', cx - 10, cy - r - 10)
  circleCtx.fillText('180°', cx - r - 35, cy + 5)
  circleCtx.fillText('270°', cx - 15, cy + r + 20)
  circleCtx.fillText('360°', cx + r + 10, cy + 20)
}

// ✅ 그래프
function drawGraph(angle) {
  const w = graphCanvas.width
  const h = graphCanvas.height

  graphCtx.clearRect(0, 0, w, h)

  const centerY = h / 2

  // X축
  graphCtx.beginPath()
  graphCtx.moveTo(0, centerY)
  graphCtx.lineTo(w, centerY)
  graphCtx.strokeStyle = '#888'
  graphCtx.stroke()

  // Y축
  graphCtx.beginPath()
  graphCtx.moveTo(0, 0)
  graphCtx.lineTo(0, h)
  graphCtx.stroke()

  // 눈금
  for (let i = 0; i <= 360; i += 90) {
    let x = (i / 360) * w
    graphCtx.beginPath()
    graphCtx.moveTo(x, centerY - 5)
    graphCtx.lineTo(x, centerY + 5)
    graphCtx.stroke()
  }

  // sin
  graphCtx.beginPath()
  for (let x = 0; x < w; x++) {
    let rad = (x / w) * 2 * Math.PI
    let y = centerY - Math.sin(rad) * 80
    if (x === 0) graphCtx.moveTo(x, y)
    else graphCtx.lineTo(x, y)
  }
  graphCtx.strokeStyle = '#38bdf8'
  graphCtx.stroke()

  // cos
  graphCtx.beginPath()
  for (let x = 0; x < w; x++) {
    let rad = (x / w) * 2 * Math.PI
    let y = centerY - Math.cos(rad) * 80
    if (x === 0) graphCtx.moveTo(x, y)
    else graphCtx.lineTo(x, y)
  }
  graphCtx.strokeStyle = '#f43f5e'
  graphCtx.stroke()

  // ✅ tan (끊김 포함)
  graphCtx.beginPath()
  let first = true

  for (let x = 0; x < w; x++) {
    let rad = (x / w) * 2 * Math.PI
    let tan = Math.tan(rad)

    if (Math.abs(tan) > 5) {
      first = true
      continue
    }

    let y = centerY - tan * 40

    if (first) {
      graphCtx.moveTo(x, y)
      first = false
    } else {
      graphCtx.lineTo(x, y)
    }
  }

  graphCtx.strokeStyle = '#22c55e'
  graphCtx.stroke()

  // 현재 점
  // 현재 점
  const rad = (angle * Math.PI) / 180
  const x = (angle / 360) * w

  // sin 점 (노랑)
  let ySin = centerY - Math.sin(rad) * 80
  graphCtx.beginPath()
  graphCtx.arc(x, ySin, 5, 0, Math.PI * 2)
  graphCtx.fillStyle = 'yellow'
  graphCtx.fill()

  // cos 점 (빨강)
  let yCos = centerY - Math.cos(rad) * 80
  graphCtx.beginPath()
  graphCtx.arc(x, yCos, 5, 0, Math.PI * 2)
  graphCtx.fillStyle = 'red'
  graphCtx.fill()

  // tan 점 (초록)
  let tanVal = Math.tan(rad)
  if (Math.abs(tanVal) < 5) {
    let yTan = centerY - tanVal * 40

    graphCtx.beginPath()
    graphCtx.arc(x, yTan, 5, 0, Math.PI * 2)
    graphCtx.fillStyle = 'lime'
    graphCtx.fill()
  }
}

// 시작
update()
