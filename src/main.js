import './style.css'
import elsaVideo from './videos/elsa-the-snow-queen.mp4'
import elsaFrozen2Video from './videos/elsa-the-frozen-queen-2.mp4'
import elsaThumb from './thumbnails/elsa-the-snow-queen.jpg'
import elsaFrozen2Thumb from './thumbnails/elsa-the-frozen-queen-2.jpg'

const notes = [
  { key: 'C', freq: 261.63, accent: 523.25, color: '#ff8fab', flower: '🌸' },
  { key: 'D', freq: 293.66, accent: 587.33, color: '#ffb3c6', flower: '🌼' },
  { key: 'E', freq: 329.63, accent: 659.25, color: '#cdb4db', flower: '🌺' },
  { key: 'F', freq: 349.23, accent: 698.46, color: '#a2d2ff', flower: '🌷' },
  { key: 'G', freq: 392.0, accent: 783.99, color: '#bde0fe', flower: '🪻' },
  { key: 'A', freq: 440.0, accent: 880.0, color: '#caffbf', flower: '🌻' },
  { key: 'B', freq: 493.88, accent: 987.77, color: '#ffd6a5', flower: '🌹' },
  { key: 'C2', freq: 523.25, accent: 1046.5, color: '#fdffb6', flower: '🌼' },
]

const countingItems = ['🐻', '⭐', '🫧', '🦋', '🌸', '🧸', '🌈', '🍓', '🐣', '💖']

const bundledCartoons = [
  {
    id: 'elsa-snow-queen',
    title: 'Elsa The Snow Queen',
    source: 'Bundled video',
    note: 'Added manually for in-app playback.',
    src: elsaVideo,
    thumbnail: elsaThumb,
  },
  {
    id: 'elsa-frozen-queen-2',
    title: 'Elsa The Frozen Queen 2',
    source: 'Bundled video',
    note: 'Added manually for in-app playback.',
    src: elsaFrozen2Video,
    thumbnail: elsaFrozen2Thumb,
  },
]

const lullabyPattern = [
  261.63, 329.63, 392.0, 523.25, 493.88, 392.0, 329.63, 293.66,
  261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 261.63,
]

let currentScreen = 'splash'
let currentCount = 3
let bubblesPopped = 0
let audioCtx
let bubbleTimer = null
let bubbleId = 0
let warmedCartoonId = null
let currentCartoonId = null
let autoplayTuneTimeouts = []

const app = document.querySelector('#app')

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
}

function clearAutoplayTune() {
  autoplayTuneTimeouts.forEach((id) => clearTimeout(id))
  autoplayTuneTimeouts = []
}

function layeredTone(frequency, accent, duration = 0.55) {
  ensureAudio()

  const now = audioCtx.currentTime
  const master = audioCtx.createGain()
  master.gain.setValueAtTime(0.001, now)
  master.gain.exponentialRampToValueAtTime(0.38, now + 0.04)
  master.gain.exponentialRampToValueAtTime(0.001, now + duration)
  master.connect(audioCtx.destination)

  const osc1 = audioCtx.createOscillator()
  const osc2 = audioCtx.createOscillator()
  const osc3 = audioCtx.createOscillator()

  osc1.type = 'triangle'
  osc2.type = 'sine'
  osc3.type = 'sine'

  osc1.frequency.value = frequency
  osc2.frequency.value = accent
  osc3.frequency.value = frequency * 2

  const gain1 = audioCtx.createGain()
  const gain2 = audioCtx.createGain()
  const gain3 = audioCtx.createGain()

  gain1.gain.value = 0.6
  gain2.gain.value = 0.22
  gain3.gain.value = 0.12

  osc1.connect(gain1)
  osc2.connect(gain2)
  osc3.connect(gain3)
  gain1.connect(master)
  gain2.connect(master)
  gain3.connect(master)

  osc1.start(now)
  osc2.start(now)
  osc3.start(now)
  osc1.stop(now + duration)
  osc2.stop(now + duration * 0.9)
  osc3.stop(now + duration * 0.7)
}

function playTone(frequency, accent, duration = 0.55) {
  layeredTone(frequency, accent, duration)
}

function playPop() {
  ensureAudio()

  const oscillatorA = audioCtx.createOscillator()
  const oscillatorB = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillatorA.type = 'triangle'
  oscillatorB.type = 'sine'
  oscillatorA.frequency.setValueAtTime(620, audioCtx.currentTime)
  oscillatorA.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.22)
  oscillatorB.frequency.setValueAtTime(940, audioCtx.currentTime)
  oscillatorB.frequency.exponentialRampToValueAtTime(280, audioCtx.currentTime + 0.18)

  gainNode.gain.setValueAtTime(0.24, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2)

  oscillatorA.connect(gainNode)
  oscillatorB.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillatorA.start()
  oscillatorB.start()
  oscillatorA.stop(audioCtx.currentTime + 0.22)
  oscillatorB.stop(audioCtx.currentTime + 0.18)
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

  if (currentScreen !== 'music-game') {
    clearAutoplayTune()
  }

  if (currentScreen === 'splash') {
    app.innerHTML = `
      <section class="splash-screen">
        <div class="spark spark-a"></div>
        <div class="spark spark-b"></div>
        <div class="spark spark-c"></div>
        <div class="spark spark-d"></div>
        <div class="splash-logo">Aya's App</div>
        <p class="splash-subtitle">Tiny games and sweet little moments</p>
      </section>
    `

    warmFirstCartoon()

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
        <section class="home-card premium-card shimmer-card">
          <p class="eyebrow">Welcome, little star</p>
          <h1 class="premium-title">Aya's App</h1>
          <p class="premium-subtitle">A soft and playful place for tiny hands, cozy cartoons, and sparkly games.</p>

          <div class="menu-buttons">
            <button class="menu-button games" data-nav="games">
              <span class="menu-emoji">🎠</span>
              <span class="menu-label">Games</span>
              <small>Open a playful little activity</small>
            </button>
            <button class="menu-button cartoons" data-nav="cartoons">
              <span class="menu-emoji">🎬</span>
              <span class="menu-label">Cartoons</span>
              <small>Watch her favorite videos</small>
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
        <section class="screen-card premium-card shimmer-card">
          <div class="topbar">
            <button class="back-button" data-nav="home">← Back</button>
            <div>
              <p class="eyebrow">Games</p>
              <h2>Choose a little game</h2>
            </div>
          </div>

          <div class="launch-grid">
            <button class="launch-card bubble-launch" data-nav="bubble-game">
              <span class="launch-emoji">🫧</span>
              <strong>Bubble Pop</strong>
              <small>Tap bright floating bubbles and watch them burst into sparkles.</small>
              <span class="launch-pill">Play</span>
            </button>

            <button class="launch-card music-launch" data-nav="music-game">
              <span class="launch-emoji">🎹</span>
              <strong>Musical Keyboard</strong>
              <small>Open a cheerful piano with flowers and playful sounds.</small>
              <span class="launch-pill">Play</span>
            </button>

            <button class="launch-card counting-launch" data-nav="counting-game">
              <span class="launch-emoji">🔢</span>
              <strong>Counting Time</strong>
              <small>Spot the right number with cute little pictures.</small>
              <span class="launch-pill">Play</span>
            </button>
          </div>
        </section>
      </main>
    `

    document.querySelector('[data-nav="home"]').addEventListener('click', () => {
      currentScreen = 'home'
      render()
    })

    document.querySelectorAll('.launch-card').forEach((card) => {
      card.addEventListener('click', () => {
        currentScreen = card.dataset.nav
        render()
      })
    })

    return
  }

  if (currentScreen === 'music-game') {
    stopBubbleGame()
    app.innerHTML = `
      <main class="premium-shell">
        <section class="screen-card premium-card shimmer-card game-screen">
          <div class="topbar">
            <button class="back-button" data-nav="games">← Back</button>
            <div>
              <p class="eyebrow">Music Game</p>
              <h2>Flower Piano</h2>
            </div>
            <button class="small-btn" id="play-song">Play 15s tune</button>
          </div>

          <div class="music-stage">
            <div class="music-cloud">🎼</div>
            <div class="music-cloud alt">✨</div>
            <div class="flower-row">
              <span>🌸</span><span>🌼</span><span>🌺</span><span>🌷</span><span>🪻</span><span>🌻</span>
            </div>
            <div class="piano-board">
              <div class="real-piano" id="keyboard"></div>
            </div>
          </div>
        </section>
      </main>
    `

    document.querySelector('[data-nav="games"]').addEventListener('click', () => {
      currentScreen = 'games'
      render()
    })

    renderKeyboard()
    document.querySelector('#play-song')?.addEventListener('click', playAutoplayTune)

    return
  }

  if (currentScreen === 'counting-game') {
    stopBubbleGame()
    app.innerHTML = `
      <main class="premium-shell">
        <section class="screen-card premium-card shimmer-card game-screen">
          <div class="topbar">
            <button class="back-button" data-nav="games">← Back</button>
            <div>
              <p class="eyebrow">Counting Game</p>
              <h2>How many can you count?</h2>
            </div>
            <button class="small-btn secondary-btn" id="new-count">New number</button>
          </div>

          <div class="counting-stage">
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
          </div>
        </section>
      </main>
    `

    document.querySelector('[data-nav="games"]').addEventListener('click', () => {
      currentScreen = 'games'
      render()
    })

    renderCountingGame()
    wireCountingEvents()
    return
  }

  if (currentScreen === 'bubble-game') {
    app.innerHTML = `
      <main class="premium-shell">
        <section class="screen-card premium-card shimmer-card bubble-window">
          <div class="topbar">
            <button class="back-button" data-nav="games">← Back</button>
            <div>
              <p class="eyebrow">Mini Game</p>
              <h2>Bubble Pop</h2>
            </div>
            <div class="bubble-score-panel">Popped: <strong id="bubble-score">0</strong></div>
          </div>

          <div class="bubble-game-stage" id="bubble-stage">
            <div class="bubble-glow bubble-glow-a"></div>
            <div class="bubble-glow bubble-glow-b"></div>
            <div class="bubble-glow bubble-glow-c"></div>
          </div>
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
    const current = bundledCartoons.find((video) => video.id === currentCartoonId)

    app.innerHTML = `
      <main class="premium-shell">
        <section class="screen-card premium-card shimmer-card">
          <div class="topbar">
            <button class="back-button" data-nav="home">← Back</button>
            <div>
              <p class="eyebrow">Cartoons</p>
              <h2>Watch time</h2>
            </div>
          </div>

          <section class="cartoons-panel bubbles-only-layout">
            <div class="cartoon-bubbles-stage" id="cartoon-list"></div>

            <div class="cartoon-player-wrap">
              <video id="cartoon-player" class="cartoon-player" controls playsinline preload="none"></video>
              <div class="now-playing">
                <strong id="now-playing-title">${current ? current.title : 'Choose a cartoon bubble'}</strong>
                <span id="now-playing-meta">${current ? `${current.source} • ${current.note}` : 'Tap a video bubble below to start.'}</span>
              </div>
            </div>
          </section>
        </section>
      </main>
    `

    document.querySelector('[data-nav="home"]').addEventListener('click', () => {
      currentScreen = 'home'
      render()
    })

    renderCartoons()

    if (current) {
      const player = document.querySelector('#cartoon-player')
      if (player) {
        player.src = current.src
        player.poster = current.thumbnail
        player.dataset.videoId = current.id
      }
    }
  }
}

function renderKeyboard() {
  const keyboard = document.querySelector('#keyboard')
  if (!keyboard) return
  keyboard.innerHTML = ''

  notes.forEach((note) => {
    const key = document.createElement('button')
    key.className = 'real-piano-key'
    key.style.setProperty('--key-color', note.color)
    key.innerHTML = `
      <span class="key-flower">${note.flower}</span>
      <span class="key-note">${note.key}</span>
    `
    key.addEventListener('click', () => playTone(note.freq, note.accent, 0.7))
    keyboard.appendChild(key)
  })
}

function playAutoplayTune() {
  clearAutoplayTune()
  let elapsed = 0
  let index = 0

  while (elapsed < 15000) {
    const freq = lullabyPattern[index % lullabyPattern.length]
    const accent = freq * 2
    const id = setTimeout(() => playTone(freq, accent, 0.52), elapsed)
    autoplayTuneTimeouts.push(id)
    elapsed += 480
    index += 1
  }
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

function wireCountingEvents() {
  document.querySelector('#new-count')?.addEventListener('click', renderCountingGame)

  document.querySelectorAll('.answer-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = Number(btn.dataset.answer)
      const feedback = document.querySelector('#count-feedback')
      if (!feedback) return

      if (answer === currentCount) {
        feedback.textContent = `Yay! That is ${currentCount}! ⭐`
        feedback.className = 'feedback success'
        playTone(523.25, 1046.5, 0.32)
        setTimeout(renderCountingGame, 900)
      } else {
        feedback.textContent = 'Oops, try again sweetie 💕'
        feedback.className = 'feedback'
        playTone(220, 330, 0.25)
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

  const colors = ['#ffffff', '#ffd6ec', '#bde0fe', '#caffbf', '#ffe0a8', '#e1c7ff', '#ff9ec7', '#8fdcff']

  for (let i = 0; i < 24; i += 1) {
    const particle = document.createElement('span')
    particle.className = i % 3 === 0 ? 'bubble-particle star' : 'bubble-particle'
    particle.style.setProperty('--dx', `${random(-120, 120)}px`)
    particle.style.setProperty('--dy', `${random(-135, 55)}px`)
    particle.style.setProperty('--delay', `${i * 8}ms`)
    particle.style.setProperty('--size', `${random(10, 22)}px`)
    particle.style.background = colors[random(0, colors.length - 1)]
    burst.appendChild(particle)
  }

  const ring = document.createElement('div')
  ring.className = 'bubble-ring'
  burst.appendChild(ring)

  stage.appendChild(burst)
  setTimeout(() => burst.remove(), 900)
}

function spawnBubble() {
  const stage = document.querySelector('#bubble-stage')
  if (!stage) return

  const bubble = document.createElement('button')
  const size = random(88, 142)
  const startLeft = random(4, 82)

  bubble.className = 'floating-bubble'
  bubble.dataset.id = String(bubbleId++)
  bubble.style.width = `${size}px`
  bubble.style.height = `${size}px`
  bubble.style.left = `${startLeft}%`
  bubble.style.bottom = `-${size}px`
  bubble.style.animationDuration = `${random(5, 8)}s`
  bubble.style.background = `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.96), rgba(255,255,255,0.45) 28%, ${['rgba(255, 132, 196, 0.72)', 'rgba(114, 210, 255, 0.72)', 'rgba(255, 218, 122, 0.72)', 'rgba(198, 156, 255, 0.74)', 'rgba(116, 255, 205, 0.72)'][random(0, 4)]} 65%, rgba(255,255,255,0.14))`

  bubble.innerHTML = `<span class="bubble-shine"></span><span class="bubble-shine small"></span>`

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

  for (let i = 0; i < 7; i += 1) {
    setTimeout(spawnBubble, i * 260)
  }

  bubbleTimer = setInterval(spawnBubble, 760)
}

function warmFirstCartoon() {
  if (warmedCartoonId) return
  const first = bundledCartoons[0]
  if (!first) return

  const video = document.createElement('video')
  video.preload = 'metadata'
  video.playsInline = true
  video.muted = true
  video.src = first.src
  video.load()
  warmedCartoonId = first.id
}

function playBundledCartoon(video) {
  currentCartoonId = video.id
  const player = document.querySelector('#cartoon-player')
  const title = document.querySelector('#now-playing-title')
  const meta = document.querySelector('#now-playing-meta')
  const cards = document.querySelectorAll('.cartoon-bubble-card')
  if (!player || !title || !meta) return

  cards.forEach((card) => {
    card.classList.toggle('active', card.dataset.videoId === video.id)
  })

  if (player.dataset.videoId !== video.id) {
    player.pause()
    player.src = video.src
    player.dataset.videoId = video.id
  }

  player.poster = video.thumbnail
  player.preload = 'metadata'
  player.load()
  player.play().catch(() => {})
  title.textContent = video.title
  meta.textContent = `${video.source} • ${video.note}`
}

function renderCartoons() {
  const list = document.querySelector('#cartoon-list')
  if (!list) return

  list.innerHTML = ''

  bundledCartoons.forEach((video) => {
    const card = document.createElement('button')
    card.className = 'cartoon-bubble-card video-only'
    card.dataset.videoId = video.id
    card.innerHTML = `
      <div class="cartoon-bubble-thumb-wrap giant">
        <img class="cartoon-bubble-thumb" src="${video.thumbnail}" alt="${video.title}" />
        <div class="bubble-play-button giant">▶</div>
      </div>
      <strong>${video.title}</strong>
    `
    card.addEventListener('click', () => playBundledCartoon(video))
    list.appendChild(card)
  })
}

render()
