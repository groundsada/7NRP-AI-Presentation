import { defineConfig } from 'vite'
import { spawn } from 'node:child_process'
import { writeFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = resolve(__dirname, 'public')
const LIVE_FILE = resolve(PUBLIC_DIR, 'sudoku-live.html')

const PROMPT = [
  'Write a single complete HTML5 file that implements a playable Flappy Bird game with a sunset theme. One self-contained file · inline <style>, inline <script>, no external assets.',
  'Layout: a centered <canvas> (480 x 640) in the middle of the page, dark page background, the canvas itself shows the sky.',
  'Sky background: a warm sunset gradient painted on the canvas each frame · top #ff8a3d (orange), middle #ff5e7e (pink), bottom #5e3a7a (dusk purple). Draw a soft sun (radial gradient circle) low on the right side, and 2-3 simple cloud shapes (overlapping ellipses, off-white) drifting slowly.',
  'Ground: a brown strip across the bottom 80px with a thin green grass line on top.',
  'Bird: a small yellow circle (radius ~14) with an orange beak (triangle) and a black eye dot. It starts at x=120, y=320, has gravity (vy += 0.45 per frame) and a flap (vy = -7.5) on Space or click or touchstart. The bird tilts slightly with vy.',
  'Pipes: green vertical rectangles in pairs (top + bottom) with a 150px gap, scrolling left at 2.4 px/frame, spawning every ~95 frames at random gap-y positions. New pairs are pushed onto an array; old ones are removed when off-screen.',
  'Collision detection between bird and any pipe rectangle, and with the ground · on collision, set state to "gameover", show a centered translucent panel with "Game Over · Score: N" and "Press Space or Click to restart". Restart resets bird, pipes, and score.',
  'Score: increment by 1 each time the bird passes a pipe. Render score top-center in white, bold, large.',
  'Loop with requestAnimationFrame. Clean fixed-step update + draw.',
  'Add a one-line caption ABOVE the canvas: <h1> "Flappy Bird · sunset" </h1> in a sans-serif, white, semi-transparent.',
  'Output ONLY the raw HTML file starting with <!DOCTYPE html> and ending with </html>. No markdown fences, no commentary.',
].join(' ')
const MODEL = 'nrp/minimax-m2'

export default defineConfig({
  server: {
    fs: {
      strict: false,
      allow: ['..', PUBLIC_DIR],
    },
  },
  plugins: [
    {
      name: 'opencode-runner',
      configureServer(server) {
        server.middlewares.use('/api/run-opencode', (req, res, next) => {
          if (req.method !== 'GET') return next()

          res.setHeader('Content-Type', 'text/event-stream')
          res.setHeader('Cache-Control', 'no-cache, no-transform')
          res.setHeader('Connection', 'keep-alive')
          res.setHeader('X-Accel-Buffering', 'no')
          res.flushHeaders?.()

          const send = (event: string, data: unknown) => {
            res.write(`event: ${event}\n`)
            res.write(`data: ${JSON.stringify(data)}\n\n`)
          }

          if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true })

          // Fresh sandbox per run so opencode's Write tool has somewhere safe to land
          const sandbox = mkdtempSync(join(tmpdir(), 'sudoku-live-'))

          const t0 = Date.now()
          send('status', { phase: 'starting', model: MODEL, prompt: PROMPT, sandbox })

          const proc = spawn(
            'opencode',
            [
              'run', PROMPT,
              '--model', MODEL,
              '--dangerously-skip-permissions',
              '--print-logs',
              '--log-level', 'INFO',
            ],
            {
              cwd: sandbox,
              env: process.env,
              shell: false,
              stdio: ['ignore', 'pipe', 'pipe'],
              detached: false,
            }
          )

          let stdoutBuf = ''

          // No filler status injection · just heartbeat for the elapsed clock.
          const tickInterval = setInterval(() => {
            send('heartbeat', { elapsed: (Date.now() - t0) / 1000 })
          }, 1000)

          proc.stdout.on('data', (chunk: Buffer) => {
            const text = chunk.toString('utf8')
            stdoutBuf += text
            send('stdout', { text })
          })

          proc.stderr.on('data', (chunk: Buffer) => {
            send('stderr', { text: chunk.toString('utf8') })
          })

          proc.on('error', (err) => {
            clearInterval(tickInterval)
            send('fail', { message: err.message })
            cleanupSandbox(sandbox)
            res.end()
          })

          proc.on('close', (code) => {
            clearInterval(tickInterval)
            const elapsed = (Date.now() - t0) / 1000

            // Strategy A: opencode wrote a file in the sandbox (the agentic path).
            const writtenHtml = findHtmlInDir(sandbox)
            // Strategy B: opencode printed HTML to stdout.
            const stdoutHtml = extractHtml(stdoutBuf)
            const html = writtenHtml ?? stdoutHtml

            if (code !== 0 && !html) {
              send('fail', { message: `opencode exited ${code} after ${elapsed.toFixed(1)}s` })
              cleanupSandbox(sandbox)
              return res.end()
            }
            if (!html) {
              send('fail', { message: 'no <html> document produced' })
              cleanupSandbox(sandbox)
              return res.end()
            }
            try {
              writeFileSync(LIVE_FILE, html, 'utf8')
              send('done', {
                file: `/sudoku-live.html?t=${Date.now()}`,
                bytes: html.length,
                elapsed,
                source: writtenHtml ? 'tool:write' : 'stdout',
              })
            } catch (e: any) {
              send('fail', { message: `write failed: ${e.message}` })
            }
            cleanupSandbox(sandbox)
            res.end()
          })

          req.on('close', () => {
            clearInterval(tickInterval)
            try { proc.kill() } catch {}
            cleanupSandbox(sandbox)
          })
        })

        // ── MCP demo endpoint ─────────────────────────────────
        const MCP_PROMPT = "who's using the most GPU on NRP lately? show me the top 5"
        const MCP_MODEL = 'nrp/minimax-m2'

        server.middlewares.use('/api/run-opencode-mcp', (req, res, next) => {
          if (req.method !== 'GET') return next()

          res.setHeader('Content-Type', 'text/event-stream')
          res.setHeader('Cache-Control', 'no-cache, no-transform')
          res.setHeader('Connection', 'keep-alive')
          res.setHeader('X-Accel-Buffering', 'no')
          res.flushHeaders?.()

          const send = (event: string, data: unknown) => {
            res.write(`event: ${event}\n`)
            res.write(`data: ${JSON.stringify(data)}\n\n`)
          }

          const sandbox = mkdtempSync(join(tmpdir(), 'mcp-live-'))
          const t0 = Date.now()
          send('status', { phase: 'starting', model: MCP_MODEL, prompt: MCP_PROMPT })

          const proc = spawn(
            'opencode',
            [
              'run', MCP_PROMPT,
              '--model', MCP_MODEL,
              '--dangerously-skip-permissions',
              '--print-logs',
              '--log-level', 'INFO',
            ],
            {
              cwd: sandbox,
              env: process.env,
              shell: false,
              stdio: ['ignore', 'pipe', 'pipe'],
              detached: false,
            }
          )

          let stdoutBuf = ''

          const tickInterval = setInterval(() => {
            send('heartbeat', { elapsed: (Date.now() - t0) / 1000 })
          }, 1000)

          proc.stdout.on('data', (chunk: Buffer) => {
            const text = chunk.toString('utf8')
            stdoutBuf += text
            send('stdout', { text })
          })

          proc.stderr.on('data', (chunk: Buffer) => {
            const text = chunk.toString('utf8')
            // Detect tool-call lines and surface them as a typed event
            const lines = text.split('\n')
            for (const line of lines) {
              if (!line) continue
              const toolMatch = line.match(/nrp-accounting_(\w+)\s*(\{.*)?$/)
              if (toolMatch) {
                let args: any = null
                if (toolMatch[2]) {
                  try { args = JSON.parse(toolMatch[2]) } catch { args = toolMatch[2] }
                }
                send('tool', { name: `nrp-accounting_${toolMatch[1]}`, args })
              }
            }
            send('stderr', { text })
          })

          proc.on('error', (err) => {
            clearInterval(tickInterval)
            send('fail', { message: err.message })
            cleanupSandbox(sandbox)
            res.end()
          })

          proc.on('close', (code) => {
            clearInterval(tickInterval)
            const elapsed = (Date.now() - t0) / 1000
            const cleaned = stripAnsi(stdoutBuf).trim()
            const parsed = parseMcpTable(cleaned)
            // If opencode produced any output, surface it · don't fail the demo just because we couldn't parse.
            if (!cleaned && code !== 0) {
              send('fail', { message: `opencode exited ${code} after ${elapsed.toFixed(1)}s with no output` })
              cleanupSandbox(sandbox)
              return res.end()
            }
            send('done', {
              elapsed,
              raw: cleaned,
              rows: parsed.rows,
              summary: parsed.summary,
            })
            cleanupSandbox(sandbox)
            res.end()
          })

          req.on('close', () => {
            clearInterval(tickInterval)
            try { proc.kill() } catch {}
            cleanupSandbox(sandbox)
          })
        })
      },
    },
  ],
})

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
}

function parseMcpTable(s: string): { rows: { namespace: string; gpu_hours: number }[]; summary: string } {
  const rows: { namespace: string; gpu_hours: number }[] = []
  const lines = s.split('\n')
  for (const ln of lines) {
    // Split row into cells, ignoring leading/trailing pipes
    const trimmed = ln.trim()
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue
    const cells = trimmed.slice(1, -1).split('|').map(c => c.trim())
    if (cells.length < 2) continue
    // Skip header / divider rows
    if (cells.every(c => /^[-: ]+$/.test(c))) continue
    if (cells.some(c => /^(namespace|gpu.?hours?|#|rank|name)$/i.test(c))) continue

    // The numeric column is "gpu hours". Pick the rightmost cell that parses as a number.
    let hours: number | null = null
    for (let i = cells.length - 1; i >= 0; i--) {
      const v = parseFloat(cells[i].replace(/[*,_`]/g, '').replace(/,/g, ''))
      if (Number.isFinite(v) && v > 0) { hours = v; break }
    }
    if (hours === null) continue

    // The namespace is the first non-numeric, non-rank cell (strip markdown emphasis).
    let name: string | null = null
    for (const c of cells) {
      const stripped = c.replace(/^\*+|\*+$/g, '').replace(/^`|`$/g, '').trim()
      if (!stripped) continue
      // Skip pure-numeric rank cells (1, 2, 3 …)
      if (/^\d+$/.test(stripped)) continue
      if (/^[\d,.]+$/.test(stripped)) continue
      name = stripped; break
    }
    if (!name) continue

    rows.push({ namespace: name, gpu_hours: Math.round(hours) })
  }
  // First non-table paragraph after the table = summary
  let summary = ''
  const summaryMatch = s.match(/(?:^|\n\n)(?:\*\*Summary[:\*]*\s*)?([^\n|][\s\S]+?)(?:\n\n|$)/m)
  if (summaryMatch) {
    summary = summaryMatch[1].replace(/^\*\*[^*]+\*\*:?\s*/, '').trim()
    if (summary.includes('|')) summary = ''
  }
  return { rows, summary }
}

function findHtmlInDir(dir: string): string | null {
  try {
    const files = readdirSync(dir).filter(f => f.toLowerCase().endsWith('.html'))
    if (!files.length) return null
    // Pick the largest file — opencode sometimes writes both a draft and a full version
    let pick = files[0]
    let pickSize = 0
    for (const f of files) {
      const stat = readFileSync(join(dir, f), 'utf8')
      if (stat.length > pickSize) { pick = f; pickSize = stat.length }
    }
    return readFileSync(join(dir, pick), 'utf8')
  } catch {
    return null
  }
}

function extractHtml(s: string): string | null {
  const start = s.search(/<!DOCTYPE\s+html/i)
  const endMatch = s.match(/<\/html>/i)
  if (start === -1 || !endMatch || endMatch.index === undefined) return null
  return s.slice(start, endMatch.index + endMatch[0].length)
}

function cleanupSandbox(dir: string) {
  try { rmSync(dir, { recursive: true, force: true }) } catch {}
}
