<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  prebakedSrc?: string
  liveEndpoint?: string
  fallbackLabel?: string
}>()

const PREBAKED = props.prebakedSrc ?? '/mcp-prebaked.json'
const ENDPOINT = props.liveEndpoint ?? '/api/run-opencode-mcp'
const FALLBACK_LABEL = props.fallbackLabel ?? "🛟 Lifeboat · press me if you publicly embarrassed yourself by betting on a live demo not breaking, AGAIN"

type Phase = 'idle' | 'running' | 'done' | 'error' | 'prebaked'

type Tool = { name: string; args: any | null }
type Row  = { namespace: string; gpu_hours: number }
type Line = { kind: 'cmd' | 'status' | 'tool' | 'stderr' | 'ok' | 'fail'; text: string }

const prompt = ref(`who's using the most GPU on NRP lately? show me the top 5`)
const model = ref('nrp/minimax-m2')

const phase = ref<Phase>('idle')
const elapsed = ref(0)
const lines = ref<Line[]>([])
const tools = ref<Tool[]>([])
const rows = ref<Row[]>([])
const summary = ref('')
const rawText = ref('')
const showResult = ref(false)
const errorMsg = ref('')
const sourceLabel = ref('')

let es: EventSource | null = null
let tick: ReturnType<typeof setInterval> | null = null

const maxHours = computed(() => rows.value.reduce((m, r) => Math.max(m, r.gpu_hours), 0) || 1)

function pushLine(kind: Line['kind'], text: string) {
  if (kind === 'stderr') {
    if (/service=bus\b|service=server\b|service=db\b|service=plugin\b|service=config\b|service=lsp\b|service=format\b|service=file\b|service=share|service=default\b/.test(text)) return
    if (/subscribing|unsubscribing|publishing|disposing|fromDirectory|backend selected|opening database|applying migrations|bootstrapping|loading internal plugin/.test(text)) return
    const m = text.match(/service=(provider|session|tool)\S*\s+.*?status=(\w+)/)
    if (m) text = `· ${m[1]} ${m[2]}`
    else text = text.replace(/^INFO\s+\S+\s+\+\d+ms\s+/, '').replace(/\x1b\[[0-9;]*m/g, '').trim()
    if (!text || text === '·') return
  }
  lines.value.push({ kind, text })
  if (lines.value.length > 200) lines.value.splice(0, 50)
  requestAnimationFrame(() => {
    const el = document.querySelector('.mcp-term-body')
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
  tools.value = []
  rows.value = []
  summary.value = ''
  rawText.value = ''
  showResult.value = false
  errorMsg.value = ''
  sourceLabel.value = ''
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
    if (d.phase === 'starting') pushLine('status', `dialing ${d.model}…`)
    else pushLine('status', d.msg)
  })
  es.addEventListener('heartbeat', () => {})
  es.addEventListener('stderr', (e) => {
    const d = JSON.parse((e as MessageEvent).data)
    d.text.split('\n').forEach((l: string) => l && pushLine('stderr', l))
  })
  es.addEventListener('tool', (e) => {
    const d = JSON.parse((e as MessageEvent).data)
    tools.value.push(d)
    pushLine('tool', `⚙ ${d.name}${d.args ? ' ' + JSON.stringify(d.args) : ''}`)
  })
  es.addEventListener('done', (e) => {
    const d = JSON.parse((e as MessageEvent).data)
    rows.value = d.rows
    summary.value = d.summary
    rawText.value = d.raw || ''
    pushLine('ok', `✓ ${d.rows.length} rows in ${d.elapsed.toFixed(1)}s`)
    sourceLabel.value = 'live · minimax-m2 just queried the cluster'
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

async function loadPrebaked() {
  reset()
  try {
    const r = await fetch(PREBAKED + '?t=' + Date.now())
    const d = await r.json()
    tools.value = d.tool_calls || []
    rows.value = d.rows || []
    summary.value = d.summary || ''
    rawText.value = d.raw_output || ''
    sourceLabel.value = `pre-baked · same prompt, run earlier (${d.elapsed_seconds}s)`
    phase.value = 'prebaked'
  } catch (e: any) {
    errorMsg.value = e.message
    phase.value = 'error'
  }
}

onMounted(() => {})
onUnmounted(() => {
  if (es) { es.close(); es = null }
  stopClock()
})
</script>

<template>
  <div class="mcp-demo">

    <div class="mcp-prompt-card">
      <div class="mcp-prompt-meta">
        <span class="mcp-prompt-label">Prompt · sent verbatim to opencode (with MCP tools enabled)</span>
        <span class="mcp-prompt-tag">{{ model }} + nrp-accounting MCP</span>
      </div>
      <div class="mcp-prompt-text">› {{ prompt }}</div>
    </div>

    <div class="mcp-controls">
      <button class="mcp-btn primary" :disabled="phase === 'running'" @click="runLive">
        <span>▶</span>
        {{ phase === 'running' ? `Running · ${elapsed.toFixed(1)}s` : 'Run it live · agent + MCP' }}
      </button>
      <button class="mcp-btn fallback" @click="loadPrebaked">{{ FALLBACK_LABEL }}</button>
      <span class="mcp-meta">
        <span v-if="phase === 'running'">⏱ streaming · agent reasoning</span>
        <span v-else-if="phase === 'done' || phase === 'prebaked'">✓ {{ sourceLabel }}</span>
        <span v-else-if="phase === 'error'">✗ {{ errorMsg }} · grab the lifeboat</span>
        <span v-else>idle · agent is one click away</span>
      </span>
    </div>

    <div class="mcp-stage">
      <div class="mcp-term">
        <div class="mcp-term-bar">
          <span class="terminal-dot r"></span>
          <span class="terminal-dot y"></span>
          <span class="terminal-dot g"></span>
          <span style="margin-left: 0.5rem;">opencode · MCP tool calls + agent log</span>
        </div>
        <div class="mcp-term-body">
          <pre v-if="lines.length"><span v-for="(l, i) in lines" :key="i" :class="'tl tl-' + l.kind">{{ l.text }}
</span></pre>
          <pre v-else class="mcp-term-hint">tool calls and agent log will stream here when you press <strong>Run it live</strong>.</pre>
        </div>
      </div>

      <div class="mcp-result">
        <div class="mcp-result-header">
          <div class="mcp-result-title">
            {{ showResult ? 'Top 5 namespaces · GPU hours · last 30 days' : 'Raw response from minimax-m2' }}
          </div>
          <div class="mcp-result-controls">
            <div v-if="tools.length" class="mcp-result-tools">
              <span v-for="t in tools" :key="t.name" class="mcp-tool-chip">{{ t.name.replace('nrp-accounting_', '') }}</span>
            </div>
            <button class="mcp-toggle"
                    :disabled="!rows.length"
                    @click="showResult = !showResult">
              {{ showResult ? '← Show raw' : '▶ See results' }}
            </button>
          </div>
        </div>

        <div class="mcp-result-body">
          <!-- Raw view (default) -->
          <div v-if="!showResult" class="mcp-raw">
            <pre v-if="rawText">{{ rawText }}</pre>
            <div v-else class="mcp-result-empty">
              run the agent or load the cache · the raw model output will appear here
            </div>
          </div>

          <!-- Visualized view (after toggle) -->
          <template v-else>
            <div v-if="rows.length" class="mcp-bars">
              <div v-for="(r, i) in rows" :key="r.namespace" class="mcp-bar-row">
                <div class="mcp-bar-rank">#{{ i + 1 }}</div>
                <div class="mcp-bar-name">{{ r.namespace }}</div>
                <div class="mcp-bar-track">
                  <div class="mcp-bar-fill"
                       :style="{ width: ((r.gpu_hours / maxHours) * 100) + '%', animationDelay: (0.05 + i * 0.08) + 's' }"></div>
                </div>
                <div class="mcp-bar-val">{{ r.gpu_hours.toLocaleString() }}</div>
              </div>
            </div>
            <div v-if="summary" class="mcp-summary">
              <span class="mcp-summary-mark">↳</span>
              <span>{{ summary }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.mcp-demo {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.4rem;
}

.mcp-prompt-card {
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-left: 3px solid var(--primary, #0161ef);
  border-radius: 10px;
  padding: 0.55rem 0.85rem 0.65rem;
  background: linear-gradient(90deg, rgba(1, 97, 239, 0.10), rgba(229, 236, 246, 0.02));
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mcp-prompt-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.mcp-prompt-label { color: var(--primary, #0161ef); font-weight: 700; }

.mcp-prompt-tag {
  color: var(--muted, rgba(229, 236, 246, 0.66));
  padding: 0.18rem 0.5rem;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-radius: 999px;
}

.mcp-prompt-text {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.92rem;
  line-height: 1.4;
  color: var(--heading, #f7f8f8);
}

.mcp-controls {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: nowrap;
  min-width: 0;
}

.mcp-btn {
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

.mcp-btn.primary {
  background: linear-gradient(135deg, #6d28d9, #0161ef);
  color: #ffffff;
  border-color: #6d28d9;
  box-shadow: 0 0 18px rgba(109, 40, 217, 0.4);
}
.mcp-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 0 24px rgba(109, 40, 217, 0.55);
}
.mcp-btn.primary:disabled { opacity: 0.7; cursor: progress; }

.mcp-btn.fallback {
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
.mcp-btn.fallback:hover {
  background: rgba(245, 200, 125, 0.22);
  transform: translateY(-1px);
}

.mcp-meta {
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

.mcp-stage {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 0.55rem;
  height: 19rem;
}

.mcp-term {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-radius: 12px;
  overflow: hidden;
  background: rgba(2, 4, 18, 0.85);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.mcp-term-bar {
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

.mcp-term-body {
  flex: 1;
  overflow: auto;
  padding: 0.65rem 0.9rem;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.66rem;
  line-height: 1.5;
}

.mcp-term-body pre {
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
.tl-tool   { color: #a07dff; font-weight: 600; }
.tl-stderr { color: rgba(229, 236, 246, 0.42); font-size: 0.6rem; }
.tl-ok     { color: #7bf2c9; font-weight: 600; }
.tl-fail   { color: #ff5e7e; font-weight: 600; }

.mcp-term-hint { color: rgba(229, 236, 246, 0.5); }

.mcp-result {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(109, 40, 217, 0.12), rgba(229, 236, 246, 0.02));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}

.mcp-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.55rem 0.95rem;
  border-bottom: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  background: rgba(229, 236, 246, 0.04);
}

.mcp-result-title {
  font-family: var(--sans, 'Inter', sans-serif);
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--heading, #f7f8f8);
  letter-spacing: -0.01em;
}

.mcp-result-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mcp-result-tools {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.mcp-toggle {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.32rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #a07dff;
  background: rgba(160, 125, 255, 0.18);
  color: #c4b5fd;
  transition: all 0.15s ease;
}
.mcp-toggle:hover:not(:disabled) {
  background: rgba(160, 125, 255, 0.32);
  transform: translateY(-1px);
}
.mcp-toggle:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.mcp-raw {
  flex: 1;
  display: flex;
}

.mcp-raw pre {
  flex: 1;
  margin: 0;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--heading, #f7f8f8);
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(2, 4, 18, 0.5) !important;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14)) !important;
  border-radius: 8px !important;
  padding: 0.8rem 1rem !important;
  box-shadow: inset 0 1px 0 rgba(229, 236, 246, 0.04) !important;
  overflow: auto;
}

.mcp-tool-chip {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.55rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #a07dff;
  border: 1px solid rgba(160, 125, 255, 0.5);
  background: rgba(109, 40, 217, 0.18);
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
}

.mcp-result-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.85rem 1rem 1rem;
  overflow: auto;
}

.mcp-bars {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.mcp-bar-row {
  display: grid;
  grid-template-columns: 1.6rem 8.5rem 1fr 5rem;
  align-items: center;
  gap: 0.55rem;
}

.mcp-bar-rank {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  color: rgba(229, 236, 246, 0.5);
  font-weight: 700;
}

.mcp-bar-name {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.78rem;
  color: var(--heading, #f7f8f8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mcp-bar-track {
  height: 1.05rem;
  background: rgba(229, 236, 246, 0.05);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
}

.mcp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6d28d9, #0161ef, #65c9ff);
  border-radius: 4px 0 0 4px;
  animation: mcpBar 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  transform-origin: left;
  box-shadow: 0 0 12px rgba(109, 40, 217, 0.4);
}

.mcp-bar-val {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.74rem;
  font-weight: 600;
  color: #a07dff;
  text-align: right;
}

@keyframes mcpBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.mcp-result-empty {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(229, 236, 246, 0.45);
  padding: 1.4rem 0;
  text-align: center;
}

.mcp-summary {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin-top: 0.4rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  font-family: var(--sans, 'Inter', sans-serif);
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--text, #e5ecf6);
  opacity: 0.92;
}

.mcp-summary-mark {
  color: #a07dff;
  font-family: var(--mono);
  font-weight: 700;
}
</style>
