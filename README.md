# AI Inference and Infrastructure

A 30-minute presentation prepared for the **7th National Research Platform Workshop** (7NRP) — QI Auditorium, UC San Diego / SDSC, 2026.

**Speaker:** Mohammad Firas Sada · `mfsada@ucsd.edu`

## What's in the deck

A walk through how the National Research Platform exposes **1,532 GPUs across 248 nodes** as a single OpenAI-compatible LLM endpoint at `ellm.nrp-nautilus.io` — 74 of them reserved for shared inference (~4.8% of the fleet). Includes two live agentic-coding demos.

## Running it

The deck is a [Slidev](https://sli.dev) project — Markdown slides with Vue components and full CSS control.

```bash
pnpm install
pnpm dev          # → http://localhost:3030
pnpm build        # static export
```

Slidev docs: https://sli.dev

## How it was built

The deck (framework and design) was mostly **vibecoded**. Markdown edits, Vue component scaffolding, CSS tuning, live `kubectl` queries against the NRP cluster for accurate GPU inventory, and web-searched model release dates were all driven by an agentic coding loop using [skills](https://sli.dev/guide/work-with-ai) for repeated tasks.

### Custom Vue components

- **`components/LiveSudoku.vue`** — live demo wrapper. Streams output from a local [`opencode`](https://opencode.ai) agent over Server-Sent Events as the agent builds a small HTML5 game on stage.
- **`components/LiveMcpDemo.vue`** — same pattern, but the agent calls the NRP Accounting MCP server (`nrp-accounting-mcp.nrp-nautilus.io`).
- **`components/ModelCard.vue`** — model fleet cards with status pills and capability tags.

### Vite middleware

`vite.config.ts` registers two SSE endpoints (`/api/run-opencode`, `/api/run-opencode-mcp`) that spawn `opencode` as a subprocess and pipe its stdout straight into the slide.

## Agentic coding with NRP LLMs

Every coding agent in the demos talks to the same OpenAI-compatible endpoint:

```bash
export OPENAI_API_KEY=$NRP_TOKEN
export OPENAI_BASE_URL=https://ellm.nrp-nautilus.io/v1
# pick a model: nrp/minimax-m2 · nrp/qwen3 · nrp/glm-4.7 · nrp/kimi · ...
```

Works unchanged with **opencode**, **Crush**, **Kimi CLI**, **GitHub Copilot CLI**, and any OpenAI SDK.

**Full setup guide:** https://nrp.ai/documentation/userdocs/ai/llm-managed/

## Layout

```
slides.md          all slides (mdc Markdown)
style.css          all theming
components/        Vue components used inside slides
public/            screenshots, prebaked HTML demos, assets
vite.config.ts     SSE endpoints that wrap `opencode`
```

## Credits

- Slides framework: [Slidev](https://sli.dev) by Anthony Fu and contributors
- Inference platform: [National Research Platform](https://nrp.ai)
- Agentic CLI: [opencode](https://opencode.ai)

## License

Slides © 2026 Mohammad Firas Sada. Code under MIT.
