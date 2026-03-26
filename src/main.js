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

let currentCount = 3
let score = 0
let bubblesPopped = 0
let audioCtx

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="app-shell">
    <section class="hero card">
      <div>
        <p class="eyebrow">For little hands & happy giggles</p>
        <h1>Aya’s App</h1>
        <p class="subtitle">A sweet little play space for music, popping bubbles, and learning numbers.</p>
      </div>
      <div class="hero-badges">
        <span>🎹 Music</span>
        <span>🫧 Bubbles</span>
        <span>🔢 Counting</span>
      </div>
    </section>

    <section class="grid">
      <article class="card section-card">
        <div class="section-header">
          <div>
            <p class="mini">Musical Keyboard</p>
            <h2>Tap the rainbow keys</h2>
          </div>
          <button class="small-btn" id="play-song">Play a little tune</button>
        </div>
        <div class="keyboard" id="keyboard"></div>
      </article>

      <article class="card section-card">
        <div class="section-header">
          <div>
            <p class="mini">Bubble Pop</p>
            <h2>Pop all the bubbles</h2>
          </div>
          <div class="bubble-score">Popped: <strong id="bubble-score">0</strong></div>
        </div>
        <div class="bubble-area" id="bubble-area"></div>
        <button class="big-btn secondary" id="reset-bubbles">More bubbles</button>
      </article>

      <article class="card section-card counting-card">
        <div class="section-header">
          <div>
            <p class="mini">Numbers & Counting</p>
            <h2>How many can you count?</h2>
          </div>
          <button class="small-btn" id="new-count">New number</button>
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
      </article>
    </section>
  </main>
`

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
  oscillator.frequency.setValueAtTime(520, audioCtx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.12)
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14)
  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.15)
}

function renderKeyboard() {
  const keyboard = document.querySelector('#keyboard')
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

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function renderBubbles() {
  const area = document.querySelector('#bubble-area')
  area.innerHTML = ''

  for (let i = 0; i < 12; i += 1) {
    const bubble = document.createElement('button')
    bubble.className = 'bubble'
    bubble.style.left = `${random(4, 84)}%`
    bubble.style.top = `${random(6, 76)}%`
    bubble.style.width = `${random(58, 100)}px`
    bubble.style.height = bubble.style.width
    bubble.style.animationDuration = `${random(3, 6)}s`

    bubble.addEventListener('click', () => {
      bubble.classList.add('burst')
      bubblesPopped += 1
      document.querySelector('#bubble-score').textContent = bubblesPopped
      playPop()
      setTimeout(() => bubble.remove(), 180)
    })

    area.appendChild(bubble)
  }
}

function renderCountingGame() {
  currentCount = random(1, 5)
  const countNumber = document.querySelector('#count-number')
  const countItemsWrap = document.querySelector('#count-items')
  const feedback = document.querySelector('#count-feedback')

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

function wireEvents() {
  document.querySelector('#reset-bubbles').addEventListener('click', renderBubbles)
  document.querySelector('#new-count').addEventListener('click', renderCountingGame)

  document.querySelector('#play-song').addEventListener('click', async () => {
    const tune = [261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66, 261.63]
    for (const [index, freq] of tune.entries()) {
      setTimeout(() => playTone(freq, 0.35), index * 280)
    }
  })

  document.querySelectorAll('.answer-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = Number(btn.dataset.answer)
      const feedback = document.querySelector('#count-feedback')
      if (answer === currentCount) {
        score += 1
        feedback.textContent = `Yay! That is ${currentCount}! ⭐`
        feedback.className = 'feedback success'
        playTone(523.25, 0.25)
        setTimeout(renderCountingGame, 900)
      } else {
        feedback.textContent = `Oops, try again sweetie 💕`
        feedback.className = 'feedback'
        playTone(220, 0.2)
      }
    })
  })
}

renderKeyboard()
renderBubbles()
renderCountingGame()
wireEvents()
