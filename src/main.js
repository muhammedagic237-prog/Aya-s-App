import './style.css'

const notes = [
  { key: 'C', freq: 261.63, color: '#ff8fab' },
  { key: 'D', freq: 293.66, color: '#ffb3c6' },
  { key: 'E', freq: 329.63, color: '#cdb4db' },
  { key: 'F', freq: 349.23, color: '#a2d2ff' },
  { key: 'G', freq: 392.0, color: '#bde0fe' },
  { key: 'A', freq: 440.0, color: '#caffbf' },
  { key: 'B', freq: 493.88, color: '#ffd6a5' },
]

const countingItems = ['🐻', '⭐', '🫧', '🦋', '🌸', '🧸', '🌈', '🍓', '🐣', '💖']

const cartoonVideos = [
  {
    title: 'Little Red Riding Hood',
    source: 'External legal source',
    note: 'Open in a new tab if direct stream blocks in-browser playback.',
    url: 'https://publicdomainmovie.net/movie/little-red-riding-hood-1931',
  },
  {
    title: 'Jack Frost',
    source: 'External legal source',
    note: 'Classic public-domain cartoon page.',
    url: 'https://publicdomainmovie.net/movie/jack-frost-1934',
  },
  {
    title: 'The Cobweb Hotel',
    source: 'External legal source',
    note: 'Public-domain cartoon page.',
    url: 'https://publicdomainmovie.net/movie/the-cobweb-hotel-1936',
  },
]

let currentScreen = 'splash'
let currentCount = 3
let bubblesPopped = 0
let audioCtx
let bubbleTimer = null
let bubbleId = 0

const app = document.querySelector('#app')

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
}

function playTone(frequency, duration = 0.45) {
  ensureAudio()
  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.03)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  oscillator.start()
  oscillator.stop(audioCtx.currentTime + duration)
}

function playPop() {
  ensureAudio()
  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(540, audioCtx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.15)
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16)
  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.17)
}

function stopBubbleGame() {
  if (bubbleTimer) {
    clearInterval(bubbleTimer)
    bubbleTimer = null
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function render() {
  app.innerHTML = ''

  if (currentScreen === 'splash') {
    app.innerHTML = `
      <section class="splash-screen">
        <div class="spark spark-a"></div>
        <div class="spark spark-b"></div>
        <div class="spark spark-c"></div>
        <div class="splash-logo">Aya's App</div>
        <p class="splash-subtitle">Tiny games and sweet little moments</p>
      </section>
    `

    setTimeout(() => {
      currentScreen = 'home'
      render()
    }, 2500)
    return
  }

  if (currentScreen === 'home') {
    stopBubbleGame()
    app.innerHTML = `
      <main class="premium-shell">
        <section class="home-card premium-card">
          <p class="eyebrow">Welcome, little star</p>
          <h1 class="premium-title">Aya's App</h1>
          <p class="premium-subtitle">A soft and playful place for tiny hands.</p>

          <div class="menu-buttons">
            <button class="menu-button games" data-nav="games">
              <span class="menu-emoji">🎠</span>
              <span class="menu-label">Games</span>
              <small>Play, tap, pop and learn</small>
            </button>
            <button class="menu-button cartoons" data-nav="cartoons">
              <span class="menu-emoji">🎬</span>
              <span class="menu-label">Cartoons</span>
              <small>Safe watch area and future offline library</small>
            </button>
          </div>
        </section>
      </main>
    `

    document.querySelectorAll('[data-nav]').forEach((button) => {
      button.addEventListener('click', () => {
        currentScreen = button.dataset.nav
        render()
      })
    })

    return
  }

  if (currentScreen === 'games') {
    stopBubbleGame()
    app.innerHTML = `
      <main class="premium-shell">
        <section class="screen-card premium-card">
          <div class="topbar">
            <button class="back-button" data-nav="home">← Back</button>
            <div>
              <p class="eyebrow">Games</p>
              <h2>Choose a little game</h2>
            </div>
          </div>

          <div class="game-grid">
            <button class="feature-card bubble-card" data-nav="bubble-game">
              <span class="feature-emoji">🫧</span>
              <strong>Bubble Pop</strong>
              <small>Bubbles float up and pop with sparkles.</small>
            </button>

            <section class="feature-card keyboard-card">
              <div class="feature-headline">
                <span class="feature-emoji">🎹</span>
                <div>
                  <strong>Musical Keyboard</strong>
                  <small>Tap the rainbow notes</small>
                </div>
              </div>
              <div class="keyboard" id="keyboard"></div>
              <button class="small-btn" id="play-song">Play a little tune</button>
            </section>

            <section class="feature-card counting-card">
              <div class="feature-headline">
                <span class="feature-emoji">🔢</span>
                <div>
                  <strong>Counting Time</strong>
                  <small>Pick the matching number</small>
                </div>
              </div>
              <div class="count-number" id="count-number">3</div>
              <div class="count-items" id="count-items"></div>
              <div class="count-actions">
                <button class="answer-btn" data-answer="1">1</button>
                <button class="answer-btn" data-answer="2">2</button>
                <button class="answer-btn" data-answer="3">3</button>
                <button class="answer-btn" data-answer="4">4</button>
                <button class="answer-btn" data-answer="5">5</button>
              </div>
              <p class="feedback" id="count-feedback">Tap the number that matches the picture.</p>
              <button class="small-btn secondary-btn" id="new-count">New number</button>
            </section>
          </div>
        </section>
      </main>
    `

    document.querySelector('[data-nav="home"]').addEventListener('click', () => {
      currentScreen = 'home'
      render()
    })

    document.querySelector('[data-nav="bubble-game"]').addEventListener('click', () => {
      currentScreen = 'bubble-game'
      render()
    })

    renderKeyboard()
    renderCountingGame()
    wireGameEvents()
    return
  }

  if (currentScreen === 'bubble-game') {
    app.innerHTML = `
      <main class="premium-shell">
        <section class="screen-card premium-card bubble-window">
          <div class="topbar">
            <button class="back-button" data-nav="games">← Back</button>
            <div>
              <p class="eyebrow">Mini Game</p>
              <h2>Bubble Pop</h2>
            </div>
            <div class="bubble-score-panel">Popped: <strong id="bubble-score">0</strong></div>
          </div>

          <div class="bubble-game-stage" id="bubble-stage"></div>
        </section>
      </main>
    `

    document.querySelector('[data-nav="games"]').addEventListener('click', () => {
      currentScreen = 'games'
      render()
    })

    startBubbleGame()
    return
  }

  if (currentScreen === 'cartoons') {
    stopBubbleGame()
    app.innerHTML = `
      <main class="premium-shell">
        <section class="screen-card premium-card">
          <div class="topbar">
            <button class="back-button" data-nav="home">← Back</button>
            <div>
              <p class="eyebrow">Cartoons</p>
              <h2>Safe watch area</h2>
            </div>
          </div>

          <section class="cartoons-panel">
            <div class="cartoon-status-card">
              <h3>Streaming status</h3>
              <p>
                Direct in-app streaming from public-domain sites is unreliable because many sources do not expose stable CORS-friendly video files.
                So this version uses a safer architecture: curated legal sources now, with room for a stronger offline/video-library layer next.
              </p>
              <div class="cartoon-architecture">
                <span>Now: legal source links</span>
                <span>Next: proper hosted/offline library</span>
              </div>
            </div>

            <div class="cartoon-list" id="cartoon-list"></div>
          </section>
        </section>
      </main>
    `

    document.querySelector('[data-nav="home"]').addEventListener('click', () => {
      currentScreen = 'home'
      render()
    })

    renderCartoons()
  }
}

function renderKeyboard() {
  const keyboard = document.querySelector('#keyboard')
  if (!keyboard) return
  keyboard.innerHTML = ''

  notes.forEach((note) => {
    const btn = document.createElement('button')
    btn.className = 'piano-key'
    btn.style.background = note.color
    btn.innerHTML = `<span>${note.key}</span><small>♪</small>`
    btn.addEventListener('click', () => playTone(note.freq))
    keyboard.appendChild(btn)
  })
}

function renderCountingGame() {
  currentCount = random(1, 5)
  const countNumber = document.querySelector('#count-number')
  const countItemsWrap = document.querySelector('#count-items')
  const feedback = document.querySelector('#count-feedback')

  if (!countNumber || !countItemsWrap || !feedback) return

  countNumber.textContent = currentCount
  countItemsWrap.innerHTML = ''
  feedback.textContent = 'Tap the number that matches the picture.'
  feedback.className = 'feedback'

  for (let i = 0; i < currentCount; i += 1) {
    const item = document.createElement('div')
    item.className = 'count-item'
    item.textContent = countingItems[random(0, countingItems.length - 1)]
    countItemsWrap.appendChild(item)
  }
}

function wireGameEvents() {
  document.querySelector('#new-count')?.addEventListener('click', renderCountingGame)

  document.querySelector('#play-song')?.addEventListener('click', () => {
    const tune = [261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66, 261.63]
    for (const [index, freq] of tune.entries()) {
      setTimeout(() => playTone(freq, 0.35), index * 280)
    }
  })

  document.querySelectorAll('.answer-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = Number(btn.dataset.answer)
      const feedback = document.querySelector('#count-feedback')
      if (!feedback) return

      if (answer === currentCount) {
        feedback.textContent = `Yay! That is ${currentCount}! ⭐`
        feedback.className = 'feedback success'
        playTone(523.25, 0.25)
        setTimeout(renderCountingGame, 900)
      } else {
        feedback.textContent = 'Oops, try again sweetie 💕'
        feedback.className = 'feedback'
        playTone(220, 0.2)
      }
    })
  })
}

function createBurst(x, y) {
  const stage = document.querySelector('#bubble-stage')
  if (!stage) return

  const burst = document.createElement('div')
  burst.className = 'bubble-burst'
  burst.style.left = `${x}px`
  burst.style.top = `${y}px`

  for (let i = 0; i < 12; i += 1) {
    const particle = document.createElement('span')
    particle.className = 'bubble-particle'
    particle.style.setProperty('--dx', `${random(-55, 55)}px`)
    particle.style.setProperty('--dy', `${random(-70, 30)}px`)
    particle.style.setProperty('--delay', `${i * 12}ms`)
    particle.style.background = ['#ffffff', '#ffd6ec', '#bde0fe', '#caffbf', '#ffe0a8'][random(0, 4)]
    burst.appendChild(particle)
  }

  stage.appendChild(burst)
  setTimeout(() => burst.remove(), 650)
}

function spawnBubble() {
  const stage = document.querySelector('#bubble-stage')
  if (!stage) return

  const bubble = document.createElement('button')
  const size = random(72, 128)
  const startLeft = random(4, 84)

  bubble.className = 'floating-bubble'
  bubble.dataset.id = String(bubbleId++)
  bubble.style.width = `${size}px`
  bubble.style.height = `${size}px`
  bubble.style.left = `${startLeft}%`
  bubble.style.bottom = `-${size}px`
  bubble.style.animationDuration = `${random(5, 8)}s`
  bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.4) 34%, ${['rgba(255, 173, 214, 0.5)', 'rgba(173, 226, 255, 0.5)', 'rgba(255, 226, 167, 0.5)', 'rgba(208, 190, 255, 0.55)'][random(0, 3)]} 72%, rgba(255,255,255,0.1))`

  bubble.addEventListener('click', () => {
    const rect = bubble.getBoundingClientRect()
    const stageRect = stage.getBoundingClientRect()
    const x = rect.left - stageRect.left + rect.width / 2
    const y = rect.top - stageRect.top + rect.height / 2
    createBurst(x, y)
    bubblesPopped += 1
    document.querySelector('#bubble-score').textContent = bubblesPopped
    playPop()
    bubble.remove()
  })

  bubble.addEventListener('animationend', () => bubble.remove())
  stage.appendChild(bubble)
}

function startBubbleGame() {
  stopBubbleGame()
  bubblesPopped = 0
  const score = document.querySelector('#bubble-score')
  if (score) score.textContent = '0'

  for (let i = 0; i < 6; i += 1) {
    setTimeout(spawnBubble, i * 320)
  }

  bubbleTimer = setInterval(spawnBubble, 900)
}

function renderCartoons() {
  const list = document.querySelector('#cartoon-list')
  if (!list) return

  list.innerHTML = ''

  cartoonVideos.forEach((video) => {
    const card = document.createElement('a')
    card.className = 'cartoon-link-card'
    card.href = video.url
    card.target = '_blank'
    card.rel = 'noreferrer noopener'
    card.innerHTML = `
      <div class="cartoon-icon">🎞️</div>
      <div>
        <strong>${video.title}</strong>
        <span>${video.source}</span>
        <small>${video.note}</small>
      </div>
      <div class="open-pill">Open</div>
    `
    list.appendChild(card)
  })
}

render()
