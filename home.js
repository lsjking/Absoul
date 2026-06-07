/* =========================
   ✅ 스크롤 애니메이션
========================= */
const sections = document.querySelectorAll('.page')

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const bigCard = entry.target.querySelector('.big-card')
      const smallCards = entry.target.querySelectorAll('.small-card')

      if (!bigCard) return

      const ratio = entry.intersectionRatio

      // ✅ 충분히 들어왔을 때 (등장)
      if (ratio > 0.4) {
        if (!bigCard.classList.contains('show')) {
          bigCard.classList.add('show')

          smallCards.forEach((card, i) => {
            setTimeout(
              () => {
                card.classList.add('show')
              },
              200 + i * 150,
            )
          })
        }
      }

      // ✅ 충분히 벗어났을 때 (사라짐)
      else if (ratio < 0.1) {
        bigCard.classList.remove('show')
        smallCards.forEach((card) => card.classList.remove('show'))
      }
    })
  },
  {
    threshold: [0, 0.1, 0.4, 1], // ✅ 핵심
  },
)

sections.forEach((section) => observer.observe(section))

/* =========================
   ✅ 검색 기능
========================= */

const searchInput = document.getElementById('search')
const resetBtn = document.getElementById('reset')

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase()

    sections.forEach((section) => {
      const titleEl = section.querySelector('h2')
      if (!titleEl) return

      const title = titleEl.innerText.toLowerCase()
      section.classList.toggle('hidden', !title.includes(value))
    })
  })
}

/* =========================
   ✅ 초기화 버튼
========================= */

if (resetBtn && searchInput) {
  resetBtn.addEventListener('click', () => {
    searchInput.value = ''

    sections.forEach((section) => {
      section.classList.remove('hidden')
    })
  })
}

/* =========================
   ✅ TOP 버튼
========================= */

const topBtn = document.getElementById('topBtn')

window.addEventListener('scroll', () => {
  if (!topBtn) return

  topBtn.style.display = window.scrollY > 300 ? 'block' : 'none'
})

if (topBtn) {
  topBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
}
