<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const props = defineProps<{
  prebakedSrc?: string
  liveEndpoint?: string
  fallbackLabel?: string
}>()

const PREBAKED = props.prebakedSrc ?? '/flappy-prebaked.html'
const ENDPOINT = props.liveEndpoint ?? '/api/run-opencode'
const FALLBACK_LABEL = props.fallbackLabel ?? "🛟 Lifeboat · press me if you publicly embarrassed yourself by betting on a live demo not breaking"

type Phase = 'idle' | 'running' | 'done' | 'error' | 'prebaked'

type LogLine = { kind: 'cmd' | 'status' | 'stderr' | 'stdout' | 'ok' | 'fail', text: string }

const prompt = ref('build a playable html5 flappy bird game with a sunset sky — bird, pipes, gravity, flap on space, score, game over + restart. one self-contained file.')
const model = ref('nrp/minimax-m2')

const phase = ref<Phase>('idle')
const lines = ref<LogLine[]>([])
const errorMsg = ref('')
const iframeSrc = ref('')
const elapsed = ref(0)
const zoomed = ref(false)
let es: EventSource | null = null
let tick: ReturnType<typeof setInterval> | null = null

function pushLine(kind: LogLine['kind'], text: string) {
  // Drop verbose internal opencode events; keep only meaningful steps.
  if (kind === 'stderr') {
    if (/service=bus\b|service=server\b|service=db\b|service=plugin\b|service=config\b|service=lsp\b|service=format\b|service=file\b|service=share|service=default\b/.test(text)) return
    if (/subscribing|unsubscribing|publishing|disposing|fromDirectory|backend selected|opening database|applying migrations|bootstrapping|loading internal plugin/.test(text)) return
    const m = text.match(/service=(provider|session|tool)\S*\s+.*?status=(\w+)/)
    if (m) text = `· ${m[1]} ${m[2]}`
    else text = text.replace(/^INFO\s+\S+\s+\+\d+ms\s+/, '').trim()
    if (!text || text === '·') return
  }
  lines.value.push({ kind, text })
  if (lines.value.length > 200) lines.value.splice(0, 50)
  requestAnimationFrame(() => {
    const el = document.querySelector('.live-term-body')
    if (el) el.scrollTop = el.scrollHeight
  })
}

function startClock() {
  const t0 = performance.now()
  tick = setInterval(() => { elapsed.value = (performance.now() - t0) / 1000 }, 100)
}
function stopClock() { if (tick) { clearInterval(tick); tick = null } }

function reset() {
  if (es) { es.close(); es = null }
  stopClock()
  lines.value = []
  errorMsg.value = ''
  iframeSrc.value = ''
  elapsed.value = 0
  phase.value = 'idle'
}

function runLive() {
  reset()
  phase.value = 'running'
  startClock()
  pushLine('cmd', `› opencode run "${prompt.value}" --model ${model.value}`)

  es = new EventSource(ENDPOINT)
  es.addEventListener('status', (e) => {
    const d = JSON.parse((e as MessageEvent).data)
    if (d.phase === 'starting') {
      pushLine('status', `dialing ${d.model}…`)
    } else {
      pushLine('status', d.msg)
    }
  })
  es.addEventListener('heartbeat', (_e) => {
    // No log line; the elapsed clock above already shows progress.
  })
  es.addEventListener('stderr', (e) => {
    const d = JSON.parse((e as MessageEvent).data)
    d.text.split('\n').forEach((l: string) => l && pushLine('stderr', l))
  })
  es.addEventListener('stdout', (e) => {
    const d = JSON.parse((e as MessageEvent).data)
    pushLine('stdout', d.text.length > 200 ? `[stdout · ${d.text.length} bytes]` : d.text)
  })
  es.addEventListener('done', (e) => {
    const d = JSON.parse((e as MessageEvent).data)
    iframeSrc.value = d.file
    pushLine('ok', `✓ ${d.bytes.toLocaleString()} bytes written in ${d.elapsed.toFixed(1)}s`)
    phase.value = 'done'
    stopClock()
    es?.close(); es = null
  })
  es.addEventListener('fail', (e) => {
    const raw = (e as MessageEvent).data
    let msg = 'opencode failed'
    try { msg = JSON.parse(raw).message } catch {}
    errorMsg.value = msg
    pushLine('fail', `✗ ${msg}`)
    phase.value = 'error'
    stopClock()
    es?.close(); es = null
  })
  es.onerror = () => {
    if (phase.value === 'running') {
      errorMsg.value = 'event stream closed'
      pushLine('fail', '✗ event stream closed')
      phase.value = 'error'
      stopClock()
    }
  }
}

function loadPrebaked() {
  reset()
  iframeSrc.value = PREBAKED + '?t=' + Date.now()
  phase.value = 'prebaked'
}

onUnmounted(() => {
  if (es) { es.close(); es = null }
  stopClock()
})
</script>

<template>
  <div class="live-sudoku">

    <div class="live-prompt-card">
      <div class="live-prompt-meta">
        <span class="live-prompt-label">Prompt · sent verbatim to opencode</span>
        <span class="live-prompt-tag">{{ model }}</span>
      </div>
      <div class="live-prompt-text">› {{ prompt }}</div>
    </div>

    <div class="live-controls">
      <button class="live-btn primary" :disabled="phase === 'running'" @click="runLive">
        <span class="live-btn-mark">▶</span>
        {{ phase === 'running' ? `Running · ${elapsed.toFixed(1)}s` : 'Run it live · opencode + minimax-m2' }}
      </button>
      <button class="live-btn fallback" @click="loadPrebaked">
        {{ FALLBACK_LABEL }}
      </button>
      <span class="live-meta">
        <span v-if="phase === 'running'">⏱ streaming · model is generating</span>
        <span v-else-if="phase === 'done'">✓ live · minimax-m2 just wrote this on stage</span>
        <span v-else-if="phase === 'prebaked'">✓ pre-baked · same prompt, run earlier today</span>
        <span v-else-if="phase === 'error'">✗ {{ errorMsg }} · grab the lifeboat</span>
        <span v-else>idle · two ways to demo</span>
      </span>
    </div>

    <div class="live-stage" :class="{ 'live-stage-zoomed': zoomed && iframeSrc }">
      <div class="live-term">
        <div class="live-term-bar">
          <span class="terminal-dot r"></span>
          <span class="terminal-dot y"></span>
          <span class="terminal-dot g"></span>
          <span style="margin-left: 0.5rem;">opencode · streamed via SSE</span>
        </div>
        <div class="live-term-body">
          <pre v-if="lines.length"><span v-for="(l, i) in lines" :key="i" :class="'tl tl-' + l.kind">{{ l.text }}
</span></pre>
          <pre v-else class="live-term-hint">stdout / stderr will stream here when you press <strong>Run it live</strong>.</pre>
        </div>
      </div>

      <div class="live-iframe-pane" v-if="iframeSrc">
        <div class="live-term-bar">
          <span class="terminal-dot r"></span>
          <span class="terminal-dot y"></span>
          <span class="terminal-dot g"></span>
          <span style="margin-left: 0.5rem;">{{ iframeSrc.split('?')[0] }}</span>
          <button class="live-zoom-btn" @click="zoomed = !zoomed" :title="zoomed ? 'shrink result' : 'enlarge result'">
            {{ zoomed ? '✕ shrink' : '⛶ enlarge' }}
          </button>
        </div>
        <iframe :src="iframeSrc" :key="iframeSrc" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.live-sudoku {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.4rem;
}

.live-prompt-card {
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-left: 3px solid var(--primary, #0161ef);
  border-radius: 10px;
  padding: 0.55rem 0.85rem 0.65rem;
  background: linear-gradient(90deg, rgba(1, 97, 239, 0.10), rgba(229, 236, 246, 0.02));
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.live-prompt-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.live-prompt-label { color: var(--primary, #0161ef); font-weight: 700; }

.live-prompt-tag {
  color: var(--muted, rgba(229, 236, 246, 0.66));
  padding: 0.18rem 0.5rem;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-radius: 999px;
}

.live-prompt-text {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.92rem;
  line-height: 1.4;
  color: var(--heading, #f7f8f8);
}

.live-controls {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: nowrap;
  min-width: 0;
}

.live-btn {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 0.55rem 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;
  border: 1px solid;
  white-space: nowrap;
  flex-shrink: 0;
}

.live-btn-mark { font-size: 0.95em; }

.live-btn.primary {
  background: linear-gradient(135deg, #0161ef, #6d28d9);
  color: #ffffff;
  border-color: #0161ef;
  box-shadow: 0 0 18px rgba(1, 97, 239, 0.4);
}
.live-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 0 24px rgba(1, 97, 239, 0.55);
}
.live-btn.primary:disabled { opacity: 0.7; cursor: progress; }

.live-btn.fallback {
  background: rgba(245, 200, 125, 0.13);
  color: #f5c87d;
  border-color: rgba(245, 200, 125, 0.5);
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.55rem;
  font-weight: 500;
  line-height: 1.2;
  max-width: 18rem;
  white-space: normal;
  text-align: left;
  padding: 0.4rem 0.65rem;
}
.live-btn.fallback:hover {
  background: rgba(245, 200, 125, 0.22);
  transform: translateY(-1px);
}

.live-meta {
  margin-left: auto;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted, rgba(229, 236, 246, 0.66));
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-radius: 999px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
}

.live-stage {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.55rem;
  height: 16rem;
  max-height: 16rem;
  overflow: visible;
  position: relative;
}

.live-stage:has(.live-iframe-pane) {
  grid-template-columns: 1fr 1.05fr;
}

/* Zoom: make iframe pane a fullscreen overlay, freeing the slide flow */
.live-stage.live-stage-zoomed .live-iframe-pane {
  position: fixed;
  top: 4vh;
  left: 4vw;
  width: 92vw;
  height: 92vh;
  z-index: 1000;
  box-shadow: 0 0 0 100vmax rgba(2, 4, 18, 0.85), 0 24px 80px rgba(0, 0, 0, 0.7);
  border-radius: 14px;
}

.live-stage.live-stage-zoomed .live-iframe-pane iframe {
  flex: 1;
  width: 100%;
  height: 100%;
}

.live-zoom-btn {
  margin-left: auto;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: rgba(229, 236, 246, 0.06);
  color: var(--text, #e5ecf6);
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.18));
  border-radius: 5px;
  padding: 0.18rem 0.5rem;
  cursor: pointer;
  transition: background 0.12s;
  text-transform: none;
  letter-spacing: 0.04em;
}

.live-zoom-btn:hover {
  background: rgba(229, 236, 246, 0.14);
}

.live-stage.live-stage-zoomed .live-zoom-btn {
  background: #ff5e7e;
  border-color: #ff5e7e;
  color: white;
  font-weight: 600;
}

.live-term {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-radius: 12px;
  overflow: hidden;
  background: rgba(2, 4, 18, 0.85);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.live-term-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  background: rgba(229, 236, 246, 0.04);
  border-bottom: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted, rgba(229, 236, 246, 0.66));
}

.live-term-body {
  flex: 1;
  overflow: auto;
  padding: 0.7rem 0.95rem;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.7rem;
  line-height: 1.5;
}

.live-term-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  font-size: inherit !important;
  box-shadow: none !important;
}

.tl { display: block; }
.tl-cmd    { color: #f7f8f8; font-weight: 600; }
.tl-status { color: #65c9ff; }
.tl-stderr { color: rgba(229, 236, 246, 0.46); font-size: 0.62rem; }
.tl-stdout { color: rgba(229, 236, 246, 0.7); }
.tl-ok     { color: #7bf2c9; font-weight: 600; }
.tl-fail   { color: #ff5e7e; font-weight: 600; }

.live-term-hint {
  color: rgba(229, 236, 246, 0.5);
}

.live-iframe-pane {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-radius: 12px;
  overflow: hidden;
  background: #02041a;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}

.live-iframe-pane iframe {
  flex: 1;
  width: 100%;
  border: 0;
  background: #02041a;
}
</style>
