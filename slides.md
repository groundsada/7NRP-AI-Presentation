---
theme: default
title: AI Inference and Infrastructure
info: |
  NRP Conference 2026 · AI Inference and Infrastructure (30 min)
  Mohammad Firas Sada, UCSD/SDSC
class: cover-globe
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-up
mdc: true
canvasWidth: 1280
fonts:
  sans: 'Inter:400,500,600,700'
  mono: 'JetBrains Mono:400,500,600'
  provider: google
---

<div class="nrp-brand">
  <img class="nrp-brand-logo" src="/NRP-mark.jpg" alt="NRP" />
  <div class="nrp-brand-text">
    <span class="nrp-brand-line1">National Research Platform</span>
    <span class="nrp-brand-line2">7NRP Workshop · May 5 to 7, 2026</span>
  </div>
</div>

# AI Inference<br/>and Infrastructure.

<p class="subtitle">
A tour of the open, federated LLM platform NRP runs for the research and education community · what it gives you and how it's built.
</p>

<div class="cover-meta">
  <span>Speaker
    <strong>Mohammad Firas Sada</strong>
  </span>
  <span>Affiliation
    <strong>UCSD / SDSC</strong>
  </span>
  <span>Session
    <strong>Thu May 7 · QI Auditorium</strong>
  </span>
</div>

---
layout: section
class: section
transition: fade
---

## Part 01 · 15 minutes

# The Stack.

<div class="slide-footer">
  <span>01 · The Stack</span>
  <span>What we run · how you reach it</span>
</div>

---
transition: slide-left
---

<h3>What is the NRP?</h3>

# An open Kubernetes cluster, <em>federated across the world.</em>

<div class="nrp-overview">

<div class="nrp-overview-copy">
  <p>The <strong>National Research Platform</strong> is a single Kubernetes cluster that spans dozens of campuses on three continents. Every participating site contributes nodes · CPUs, GPUs, FPGAs, storage · to one shared API.</p>
  <p>You don't see racks or data centers. You see <code>kubectl</code>. You write a manifest, and somewhere on the federation a Pod runs your workload · for free.</p>
  <p>The same substrate that runs the LLM inference service runs everyone else's research workloads, side by side.</p>
</div>

<div class="nrp-stats-grid">
  <div class="nrp-stat-box">
    <div class="nrp-stat-box-v">500+</div>
    <div class="nrp-stat-box-l">Nodes</div>
    <div class="nrp-stat-box-d">CPUs, GPUs, FPGAs, storage · across all participating sites.</div>
  </div>
  <div class="nrp-stat-box">
    <div class="nrp-stat-box-v">120+</div>
    <div class="nrp-stat-box-l">Locations</div>
    <div class="nrp-stat-box-d">Universities, national labs, regional networks.</div>
  </div>
  <div class="nrp-stat-box">
    <div class="nrp-stat-box-v">1</div>
    <div class="nrp-stat-box-l">Cluster API</div>
    <div class="nrp-stat-box-d">One <code>kubeconfig</code> reaches all of it.</div>
  </div>
  <div class="nrp-stat-box">
    <div class="nrp-stat-box-v">$0</div>
    <div class="nrp-stat-box-l">For All</div>
    <div class="nrp-stat-box-d">Free at the point of use for everyone.</div>
  </div>
</div>

</div>

<div class="slide-footer">
  <span>01 · The Stack</span>
  <span>Preface · what the NRP is</span>
</div>

---
class: tone-rose
---

<h3>Step 01 · Sign in</h3>

# <code>nrp.ai</code> → Authentik → <em>CILogon → your campus.</em>

<div class="auth-twin">
  <div class="auth-twin-shot">
    <div class="screenshot-frame-bar">
      <span class="terminal-dot r"></span>
      <span class="terminal-dot y"></span>
      <span class="terminal-dot g"></span>
      <span style="margin-left: 0.5rem;">nrp.ai · click <strong>Login</strong></span>
    </div>
    <img src="/login.png" alt="NRP landing page · Login button" />
  </div>
  <div class="auth-twin-arrow">→</div>
  <div class="auth-twin-shot">
    <div class="screenshot-frame-bar">
      <span class="terminal-dot r"></span>
      <span class="terminal-dot y"></span>
      <span class="terminal-dot g"></span>
      <span style="margin-left: 0.5rem;">cilogon.org · pick your campus</span>
    </div>
    <img src="/cilogon.png" alt="CILogon institution selector" />
  </div>
</div>

<div class="auth-twin-note">
  <p>The <code>nrp.ai</code> Login button hands the OIDC flow to <span class="brand-authentik">Authentik</span> in the cluster, which delegates to <strong>CILogon</strong> · the InCommon-backed federation used by NSF/DOE. Pick your home institution from <strong>200+ campus IdPs</strong> and log in with your campus credentials. NRP receives an attested identity (email, affiliation, eduPersonPrincipalName) · <em>never your password</em>.</p>
</div>

<div class="slide-footer">
  <span>01 · The Stack</span>
  <span>Step 01 of 02 · sign in</span>
</div>

---
class: tone-rose
---

<h3>Step 02 · Mint your own token</h3>

# <code>nrp.ai/llmtoken</code> → <em>OpenAI-shaped curl.</em>

<div class="auth-step">
  <div class="auth-step-shot">
    <div class="screenshot-frame-bar">
      <span class="terminal-dot r"></span>
      <span class="terminal-dot y"></span>
      <span class="terminal-dot g"></span>
      <span style="margin-left: 0.5rem;">nrp.ai/llmtoken</span>
    </div>
    <img src="/llmtoken1.png" alt="NRP LLM token creation interface" />
  </div>
  <div class="auth-step-note">
    <div class="auth-step-note-label">What's happening</div>
    <p>Pick the group, name the token, hit <strong>Issue</strong>. The token is <strong>yours</strong> · per-user, revocable, scoped to the group's flag.</p>

```bash
curl https://ellm.nrp-nautilus.io/v1/chat/completions \
  -H "Authorization: Bearer $NRP_TOKEN" \
  -d '{ "model": "qwen3", "messages": [{ "role": "user", "content": "..." }] }'
```

  </div>
</div>

<div class="slide-footer">
  <span>01 · The Stack</span>
  <span>Step 02 of 02 · OpenAI-compatible from here on</span>
</div>

---
class: tone-green
---

<h3>The GPU fleet · live inventory</h3>

# <span class="gpu-total">1,532</span> GPUs total · <span class="gpu-total-llm">74</span> reserved for LLMs · <em>~4.8%.</em>

<div class="gpu-meta">
  <span class="logo logo-nvidia" style="width: 1.4rem; height: 1.4rem;"></span>
  <span class="gpu-meta-text">NVIDIA · sum of <code>nvidia.com/*</code> across 248 GPU nodes · LLM count = sum of StatefulSet replicas × per-pod GPUs</span>
</div>

<div class="gpu-pies">

<div class="gpu-pie-card">
  <div class="gpu-pie-card-head">All GPUs in the cluster <span class="gpu-pie-card-pct gpu-pie-card-pct-muted">sum = 1,532</span></div>
  <div class="gpu-pie-body">
    <svg viewBox="0 0 220 220" class="gpu-pie">
      <path d="M110,110 L110,15 A95,95 0 0 1 197.12,72.12 Z" fill="#f59e0b"/>
      <path d="M110,110 L197.12,72.12 A95,95 0 0 1 182.59,171.29 Z" fill="#3b82f6"/>
      <path d="M110,110 L182.59,171.29 A95,95 0 0 1 103.39,204.77 Z" fill="#6366f1"/>
      <path d="M110,110 L103.39,204.77 A95,95 0 0 1 49.63,183.35 Z" fill="#8b5cf6"/>
      <path d="M110,110 L49.63,183.35 A95,95 0 0 1 25.73,153.87 Z" fill="#ec4899"/>
      <path d="M110,110 L25.73,153.87 A95,95 0 0 1 15.36,118.19 Z" fill="#f43f5e"/>
      <path d="M110,110 L15.36,118.19 A95,95 0 0 1 18.65,83.91 Z" fill="#fb923c"/>
      <path d="M110,110 L18.65,83.91 A95,95 0 0 1 29.41,59.70 Z" fill="#06b6d4"/>
      <path d="M110,110 L29.41,59.70 A95,95 0 0 1 42.19,43.47 Z" fill="#10b981"/>
      <path d="M110,110 L42.19,43.47 A95,95 0 0 1 44.37,41.32 Z" fill="#a78bfa"/>
      <path d="M110,110 L44.37,41.32 A95,95 0 0 1 46.09,39.71 Z" fill="#22d3ee"/>
      <path d="M110,110 L46.09,39.71 A95,95 0 0 1 110,15 Z" fill="#64748b"/>
      <circle cx="110" cy="110" r="58" fill="var(--bg)"/>
      <text x="110" y="104" class="gpu-pie-center-n" text-anchor="middle">1,532</text>
      <text x="110" y="124" class="gpu-pie-center-l" text-anchor="middle">total GPUs</text>
    </svg>
    <div class="gpu-pie-legend">
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#f59e0b"></span><span class="gpu-pie-name">A100</span><span class="gpu-pie-pct">283 · 18.5%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#3b82f6"></span><span class="gpu-pie-name">A10</span><span class="gpu-pie-pct">271 · 17.7%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#6366f1"></span><span class="gpu-pie-name">RTX 3090</span><span class="gpu-pie-pct">229 · 14.9%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#8b5cf6"></span><span class="gpu-pie-name">RTX 2080 Ti</span><span class="gpu-pie-pct">151 · 9.9%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#ec4899"></span><span class="gpu-pie-name">V100</span><span class="gpu-pie-pct">98 · 6.4%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#f43f5e"></span><span class="gpu-pie-name">L4</span><span class="gpu-pie-pct">96 · 6.3%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#fb923c"></span><span class="gpu-pie-name">GTX 1080 Ti</span><span class="gpu-pie-pct">89 · 5.8%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#06b6d4"></span><span class="gpu-pie-name">L40</span><span class="gpu-pie-pct">68 · 4.4%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#10b981"></span><span class="gpu-pie-name">RTX A6000</span><span class="gpu-pie-pct">53 · 3.5%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#a78bfa"></span><span class="gpu-pie-name">RTX 6000 Bw</span><span class="gpu-pie-pct">8 · 0.5%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#22d3ee"></span><span class="gpu-pie-name">H200 NVL</span><span class="gpu-pie-pct">6 · 0.4%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#64748b"></span><span class="gpu-pie-name">12 smaller fleets</span><span class="gpu-pie-pct">180 · 11.7%</span></div>
    </div>
  </div>
</div>

<div class="gpu-pie-card gpu-pie-card-llm">
  <div class="gpu-pie-card-head">Reserved for LLM serving <span class="gpu-pie-card-pct">74 · 4.8% of fleet</span></div>
  <div class="gpu-pie-body">
    <svg viewBox="0 0 220 220" class="gpu-pie">
      <path d="M110,110 L110,15 A95,95 0 1 1 70.98,196.62 Z" fill="#f59e0b"/>
      <path d="M110,110 L70.98,196.62 A95,95 0 0 1 15.76,122.04 Z" fill="#a78bfa"/>
      <path d="M110,110 L15.76,122.04 A95,95 0 0 1 38.67,47.26 Z" fill="#22d3ee"/>
      <path d="M110,110 L38.67,47.26 A95,95 0 0 1 63.65,27.07 Z" fill="#10b981"/>
      <path d="M110,110 L63.65,27.07 A95,95 0 0 1 93.99,16.36 Z" fill="#64748b"/>
      <path d="M110,110 L93.99,16.36 A95,95 0 0 1 110,15 Z" fill="#fb7185"/>
      <circle cx="110" cy="110" r="58" fill="var(--bg)"/>
      <text x="110" y="104" class="gpu-pie-center-n" text-anchor="middle">74</text>
      <text x="110" y="124" class="gpu-pie-center-l" text-anchor="middle">LLM GPUs</text>
    </svg>
    <div class="gpu-pie-legend">
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#f59e0b"></span><span class="gpu-pie-name">A100</span><span class="gpu-pie-pct">42 · 56.8%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#a78bfa"></span><span class="gpu-pie-name">RTX 6000 Bw</span><span class="gpu-pie-pct">12 · 16.2%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#22d3ee"></span><span class="gpu-pie-name">H200 NVL</span><span class="gpu-pie-pct">10 · 13.5%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#10b981"></span><span class="gpu-pie-name">RTX A6000</span><span class="gpu-pie-pct">4 · 5.4%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#64748b"></span><span class="gpu-pie-name">generic-tier</span><span class="gpu-pie-pct">4 · 5.4%</span></div>
      <div class="gpu-pie-row"><span class="gpu-pie-dot" style="background:#fb7185"></span><span class="gpu-pie-name">GH200</span><span class="gpu-pie-pct">2 · 2.7%</span></div>
    </div>
  </div>
</div>

</div>

<div class="slide-footer">
  <span>01 · The Stack</span>
  <span>Source · <code>kubectl get nodes</code> + <code>kubectl get pods -n nrp-llm</code></span>
</div>

---
class: tone-cyan
---

<h3>How it fits in Kubernetes · putting it all together</h3>

# GPU · Pod · Envoy · Auth · World.

<div class="pod-flow">
  <div class="pod-flow-step">
    <div class="pod-flow-icon"><span class="logo logo-nvidia"></span></div>
    <div class="pod-flow-name">GPU</div>
    <div class="pod-flow-desc">Kubernetes treats GPUs as <strong>YAML resources</strong> · just like memory or CPU. <code>resources.limits.nvidia.com/a100: 4</code>, scheduler finds capacity.</div>
  </div>
  <div class="pod-flow-arrow">→</div>
  <div class="pod-flow-step">
    <div class="pod-flow-icon"><span class="logo logo-k8s"></span></div>
    <div class="pod-flow-name">Pod</div>
    <div class="pod-flow-desc">A <strong>Pod</strong> running <code>vllm serve</code> wraps the weights and exposes <code>/v1/chat/completions</code>. Its IP is <em>only reachable inside the cluster</em> · not from the internet.</div>
  </div>
  <div class="pod-flow-arrow">→</div>
  <div class="pod-flow-step">
    <div class="pod-flow-icon"><span class="logo logo-envoy"></span></div>
    <div class="pod-flow-name">Envoy</div>
    <div class="pod-flow-desc">The <strong>only door</strong> in front of every model Pod · routes <code>"model": "qwen3"</code> to the right Pod, isolates caches, <em>logs every token for accounting</em>.</div>
  </div>
  <div class="pod-flow-arrow">→</div>
  <div class="pod-flow-step">
    <div class="pod-flow-icon"><span class="brand-authentik" style="font-size: 1.1rem; font-weight: 700;">A</span></div>
    <div class="pod-flow-name">Auth</div>
    <div class="pod-flow-desc">Envoy hands the bearer to <span class="brand-authentik">Authentik</span> · which checks the token, finds your group, confirms the <code>LLM</code> flag is on. <em>No flag, no Pod.</em></div>
  </div>
  <div class="pod-flow-arrow">→</div>
  <div class="pod-flow-step">
    <div class="pod-flow-icon">🌐</div>
    <div class="pod-flow-name">World</div>
    <div class="pod-flow-desc">Your <code>curl</code>, OpenAI SDK, or coding agent on the public internet · talking to <code>ellm.nrp-nautilus.io</code> as if it were OpenAI.</div>
  </div>
</div>

<div class="pod-flow-narration">
  <p><strong>Translated for the cabin:</strong> the model itself is locked inside Kubernetes · the only thing that can reach it is Envoy. Envoy is the bouncer. It checks your token with Authentik, decides if you're allowed in, picks the right Pod, copies your prompt over, streams tokens back, and writes down everything you spent. <em>One door. One auth. One log.</em></p>
</div>

<div class="pod-flow-vllm">
  <div class="pod-flow-vllm-label">↑ inside the Pod:</div>
  <p class="pod-flow-vllm-note"><strong>vLLM</strong> is the serving engine we run for <em>shared inference</em>. For <em>training and fine-tuning</em>, NRP ships the tools and docs to make it easy to grab dedicated GPUs in your own namespace · same cluster, your weights, your schedule.</p>
</div>

<div class="slide-footer">
  <span>01 · The Stack</span>
  <span>Recap · all the pieces, in one diagram</span>
</div>

---

<h3>The model fleet · how you reach it</h3>

# Ten frontier open-weights models<br/><em>on call, today.</em>

<div class="logo-row" style="margin-bottom: 0.55rem;">
  <span class="logo-label"><span class="logo logo-alibaba"></span>Qwen</span>
  <span class="logo-label"><span class="logo logo-google"></span>Gemma</span>
  <span class="logo-label"><span class="logo logo-openai"></span>gpt-oss</span>
  <span class="logo-label" style="color: var(--text);">Moonshot · MiniMax · Zhipu · AllenAI</span>
</div>

<div class="fleet-merge">
  <div class="fleet-merge-left">
    <div class="fleet-list-head">
      <span>Model</span><span>Params</span><span>Context</span><span>Status</span>
    </div>
    <div class="fleet-list">
      <div class="fleet-list-row" data-tone="blue"   data-status="supported"><span class="fleet-list-mark">Q</span><span class="fleet-list-name">qwen3</span><span class="fleet-list-v">397B</span><span class="fleet-list-v">262K</span><span class="fleet-list-status">live</span></div>
      <div class="fleet-list-row" data-tone="cyan"   data-status="supported"><span class="fleet-list-mark">Q</span><span class="fleet-list-name">qwen3-small <em>· qwen3-27b</em></span><span class="fleet-list-v">27B</span><span class="fleet-list-v">262K</span><span class="fleet-list-status">live</span></div>
      <div class="fleet-list-row" data-tone="blue"   data-status="supported"><span class="fleet-list-mark">G</span><span class="fleet-list-name">gpt-oss</span><span class="fleet-list-v">120B</span><span class="fleet-list-v">131K</span><span class="fleet-list-status">live</span></div>
      <div class="fleet-list-row" data-tone="green"  data-status="supported"><span class="fleet-list-mark">G</span><span class="fleet-list-name">gemma</span><span class="fleet-list-v">31B</span><span class="fleet-list-v">262K</span><span class="fleet-list-status">live</span></div>
      <div class="fleet-list-row" data-tone="purple" data-status="supported"><span class="fleet-list-mark">M</span><span class="fleet-list-name">minimax-m2</span><span class="fleet-list-v">230B</span><span class="fleet-list-v">204K</span><span class="fleet-list-status">live</span></div>
      <div class="fleet-list-row" data-tone="blue"   data-status="supported"><span class="fleet-list-mark">Q</span><span class="fleet-list-name">qwen3-embedding</span><span class="fleet-list-v">8B</span><span class="fleet-list-v">—</span><span class="fleet-list-status">live</span></div>
      <div class="fleet-list-row" data-tone="amber"  data-status="evaluating"><span class="fleet-list-mark">K</span><span class="fleet-list-name">kimi</span><span class="fleet-list-v">1T MoE</span><span class="fleet-list-v">262K</span><span class="fleet-list-status">eval</span></div>
      <div class="fleet-list-row" data-tone="purple" data-status="evaluating"><span class="fleet-list-mark">Z</span><span class="fleet-list-name">glm-4.7</span><span class="fleet-list-v">358B</span><span class="fleet-list-v">202K</span><span class="fleet-list-status">eval</span></div>
      <div class="fleet-list-row" data-tone="rose"   data-status="evaluating"><span class="fleet-list-mark">O</span><span class="fleet-list-name">olmo</span><span class="fleet-list-v">32B</span><span class="fleet-list-v">64K</span><span class="fleet-list-status">eval</span></div>
      <div class="fleet-list-row" data-tone="green"  data-status="evaluating"><span class="fleet-list-mark">G</span><span class="fleet-list-name">gemma-small</span><span class="fleet-list-v">8B</span><span class="fleet-list-v">131K</span><span class="fleet-list-status">eval</span></div>
    </div>
  </div>
  <div class="fleet-merge-right">
    <div class="openwebui-shot fleet-merge-shot">
      <div class="openwebui-shot-bar">
        <span class="terminal-dot r"></span>
        <span class="terminal-dot y"></span>
        <span class="terminal-dot g"></span>
        <span style="margin-left: 0.5rem;">nrp-openwebui.nrp-nautilus.io</span>
      </div>
      <img src="/openwebui-hero.png" alt="NRP Open WebUI" />
    </div>
    <a class="fleet-merge-link" href="https://nrp-openwebui.nrp-nautilus.io">nrp-openwebui.nrp-nautilus.io →</a>
    <p class="fleet-merge-note">Aside from the API, NRP also <strong>hosts web services</strong> on top of the same models · Open WebUI, LibreChat, AnythingLLM · so users without code can drive the fleet from a browser.</p>
  </div>
</div>

<div class="slide-footer">
  <span>01 · The Stack</span>
  <span>10 models · API + hosted UIs · same endpoint under both</span>
</div>

---
layout: section
class: section
transition: fade
---

## Part 02 · 5 minutes

# Usage in Practice.

<div class="slide-footer">
  <span>02 · Usage</span>
  <span>Last 30 days · last 12 weeks</span>
</div>

---
class: tone-cyan
---

<h3>Twelve weeks of NRP LLM usage</h3>

# 71 teams · 38 institutions · <em>Qwen3 takes ⅓ of all tokens.</em>

<div class="usage-merge">

<div class="usage-merge-card">
  <div class="usage-merge-card-label">Adoption · 12 wk</div>
  <div class="usage-merge-stats">
    <div class="usage-merge-stat"><span class="usage-merge-stat-v">14 → 71</span><span class="usage-merge-stat-l">teams · W06 → W18</span></div>
    <div class="usage-merge-stat"><span class="usage-merge-stat-v">17.2 B</span><span class="usage-merge-stat-l">peak / wk · W13</span></div>
  </div>
  <div class="usage-spark">
    <span class="usage-spark-bar" style="height: 4%;"></span>
    <span class="usage-spark-bar" style="height: 8%;"></span>
    <span class="usage-spark-bar" style="height: 11%;"></span>
    <span class="usage-spark-bar" style="height: 27%;"></span>
    <span class="usage-spark-bar" style="height: 62%;"></span>
    <span class="usage-spark-bar" style="height: 40%;"></span>
    <span class="usage-spark-bar" style="height: 29%;"></span>
    <span class="usage-spark-bar usage-spark-peak" style="height: 100%;"></span>
    <span class="usage-spark-bar" style="height: 51%;"></span>
    <span class="usage-spark-bar" style="height: 41%;"></span>
    <span class="usage-spark-bar" style="height: 27%;"></span>
    <span class="usage-spark-bar" style="height: 31%;"></span>
    <span class="usage-spark-bar usage-spark-now" style="height: 50%;"></span>
  </div>
  <div class="usage-spark-axis"><span>W06</span><span class="usage-spark-axis-mid">peak W13 · 17.2 B</span><span>W18</span></div>
</div>

<div class="usage-merge-card">
  <div class="usage-merge-card-label">Top institutions · 30d</div>
  <div class="usage-bars">
    <div class="usage-bar"><span class="usage-bar-n">UC San Diego <em>CA</em></span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:100%"></span></span><span class="usage-bar-v">10.8 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">UC Santa Cruz <em>CA</em></span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:96%"></span></span><span class="usage-bar-v">10.4 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">U Arizona</span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:24%"></span></span><span class="usage-bar-v">2.6 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">Kansas State</span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:23%"></span></span><span class="usage-bar-v">2.5 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">Gladstone <em>CA</em></span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:16%"></span></span><span class="usage-bar-v">1.7 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">UI Chicago</span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:15%"></span></span><span class="usage-bar-v">1.6 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">UC Merced <em>CA</em></span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:15%"></span></span><span class="usage-bar-v">1.6 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">U South Dakota</span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:14%"></span></span><span class="usage-bar-v">1.5 B</span></div>
  </div>
  <div class="usage-merge-foot">+ 30 more · Princeton, Yonsei, Stanford, Internet2…</div>
</div>

<div class="usage-merge-card">
  <div class="usage-merge-card-label">Top models · 30d</div>
  <div class="usage-bars">
    <div class="usage-bar"><span class="usage-bar-n">Qwen3.5-397B <em>12 wk</em></span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:100%"></span></span><span class="usage-bar-v">13.1 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">GLM-4.7 <em>4.5 mo</em></span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:38%"></span></span><span class="usage-bar-v">4.9 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">gpt-oss-120b <em>9 mo</em></span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:34%"></span></span><span class="usage-bar-v">4.5 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">MiniMax-M2.7 <em>fresh</em></span><span class="usage-bar-track"><span class="usage-bar-fill usage-bar-fresh" style="width:26%"></span></span><span class="usage-bar-v">3.4 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">Gemma 4 31B <em>fresh</em></span><span class="usage-bar-track"><span class="usage-bar-fill usage-bar-fresh" style="width:16%"></span></span><span class="usage-bar-v">2.1 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">Qwen3-Embed <em>4 mo</em></span><span class="usage-bar-track"><span class="usage-bar-fill" style="width:15%"></span></span><span class="usage-bar-v">2.0 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">Qwen3.6-27B <em>fresh</em></span><span class="usage-bar-track"><span class="usage-bar-fill usage-bar-fresh" style="width:9%"></span></span><span class="usage-bar-v">1.1 B</span></div>
    <div class="usage-bar"><span class="usage-bar-n">Kimi-K2.6 <em>fresh</em></span><span class="usage-bar-track"><span class="usage-bar-fill usage-bar-fresh" style="width:6%"></span></span><span class="usage-bar-v">0.8 B</span></div>
  </div>
  <div class="usage-merge-foot">~36 B total · <strong>half &lt; 6 wk old</strong> · SOTA in days</div>
</div>

<div class="usage-merge-card">
  <div class="usage-merge-card-label">Where & shape · 30d</div>
  <div class="usage-splits">
    <div class="usage-split">
      <div class="usage-split-donut">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(229,236,246,0.16)" stroke-width="12"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="#7bf2c9" stroke-width="12" stroke-dasharray="189.7 263.9" transform="rotate(-90 50 50)"/>
        </svg>
        <div class="usage-split-donut-c"><strong>71.9%</strong><span>California</span></div>
      </div>
      <div class="usage-split-cap">CA <strong>25.9 B</strong> · rest <strong>10.1 B</strong></div>
    </div>
    <div class="usage-split usage-split-tall">
      <div class="usage-split-big">95.5<span>%</span></div>
      <div class="usage-split-label">tokens are <em>input</em></div>
      <div class="usage-split-cap">RAG &amp; long-context · not chat-style</div>
    </div>
  </div>
</div>

</div>

<div class="slide-footer">
  <span>02 · Usage</span>
  <span>Source · weekly_total_120d + per_institution_30d + ca_vs_nationwide_30d + input_vs_output_30d</span>
</div>

---
layout: section
class: section
transition: fade
---

## Part 03 · ~3 minutes

# Compelling Use Cases.

<div class="slide-footer">
  <span>03 · Use cases</span>
  <span>Four projects · what they leaned on NRP for</span>
</div>

---
class: tone-green
---

<h3>Use case 01 · Carl Boettiger · UC Berkeley</h3>

# Wetlands. <em>One app, every NRP primitive.</em>

<div class="usecase">
  <div class="usecase-shot">
    <div class="usecase-shot-bar">
      <span class="terminal-dot r"></span>
      <span class="terminal-dot y"></span>
      <span class="terminal-dot g"></span>
      <span style="margin-left: 0.4rem;">wetlands.nrp-nautilus.io</span>
    </div>
    <img src="/wetlands.png" alt="Wetlands app · global wetlands map with chatbot data assistant" />
  </div>

  <div class="usecase-meta">
    <div class="usecase-byline">
      <div class="usecase-byline-name">Carl Boettiger</div>
      <div class="usecase-byline-aff">Boettiger Lab · UC Berkeley · ESPM</div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">What it is</div>
      <div class="usecase-block-body">A user-facing app informing a global wetlands conservation effort · map + chatbot answers questions in plain language, grounded in real datasets.</div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">Stack on NRP</div>
      <div class="usecase-block-body">Static site · langchain-js chatbot on NRP LLMs · MCP server with <code>duckdb</code> over parquet on NRP S3 · STAC catalog · TiTiler for PMTiles/COGs · LLM proxy for rate limits.</div>
      <div class="usecase-stack">
        <span class="usecase-stack-pill">NRP LLMs</span>
        <span class="usecase-stack-pill">MCP</span>
        <span class="usecase-stack-pill">S3 + STAC</span>
        <span class="usecase-stack-pill">TiTiler</span>
        <span class="usecase-stack-pill">duckdb</span>
      </div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">Sibling apps</div>
      <div class="usecase-block-body"><code>ca-wolves.nrp-nautilus.io</code> · <code>high-seas.nrp-nautilus.io</code> · Jupyter-AI plugin with Fernando Perez · NRP carbon dashboard.</div>
    </div>
  </div>
</div>

<div class="slide-footer">
  <span>03 · Use cases</span>
</div>

---
class: tone-green
---

<div class="usecase-fullbleed">
  <div class="usecase-fullbleed-bar">
    <span class="terminal-dot r"></span>
    <span class="terminal-dot y"></span>
    <span class="terminal-dot g"></span>
    <span style="margin-left: 0.5rem;">ca-wolves.nrp-nautilus.io · sibling app on the same NRP primitives</span>
  </div>
  <img src="/ca-wolves.png" alt="California wolf tracking app on NRP · same stack, different domain" />
</div>

<div class="slide-footer">
  <span>03 · Use cases · Boettiger Lab</span>
  <span>Same primitives · different domain</span>
</div>

---
class: tone-rose
---

<h3>Use case 02 · Brian Bockelman · UW–Madison</h3>

# SWAMP. <em>Security analysis for any codebase · with NRP LLMs.</em>

<div class="usecase">
  <div class="usecase-shot">
    <div class="usecase-shot-bar">
      <span class="terminal-dot r"></span>
      <span class="terminal-dot y"></span>
      <span class="terminal-dot g"></span>
      <span style="margin-left: 0.4rem;">swamp.chtc.wisc.edu · projects</span>
    </div>
    <img src="/swamp-projects.png" alt="SWAMP project list view" />
  </div>

  <div class="usecase-meta">
    <div class="usecase-byline">
      <div class="usecase-byline-name">Brian Bockelman</div>
      <div class="usecase-byline-aff">CHTC · UW–Madison · Pelican Platform PI</div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">What it is</div>
      <div class="usecase-block-body">An <strong>open-source platform</strong> for LLM-driven security reviews against <em>any</em> codebase. Vulnerability findings + concrete code-level remediation.</div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">How it plugs into NRP</div>
      <div class="usecase-block-body">Authenticate with your NRP identity · SWAMP issues a <strong>project-scoped LLM key</strong> bound to an NRP group · every analysis run uses NRP's frontier models, auditable, group-metered.</div>
      <div class="usecase-stack">
        <span class="usecase-stack-pill">NRP identity</span>
        <span class="usecase-stack-pill">project-scoped keys</span>
        <span class="usecase-stack-pill">group accounting</span>
      </div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">Where it lives</div>
      <div class="usecase-block-body"><span class="usecase-url">swamp.chtc.wisc.edu</span> · run by the Center for High Throughput Computing at UW–Madison.</div>
    </div>
  </div>
</div>

<div class="slide-footer">
  <span>03 · Use cases</span>
</div>

---
class: tone-rose
---

<div class="usecase-fullbleed">
  <div class="usecase-fullbleed-bar">
    <span class="terminal-dot r"></span>
    <span class="terminal-dot y"></span>
    <span class="terminal-dot g"></span>
    <span style="margin-left: 0.5rem;">SWAMP · NRP LLM Key issued · the project-scoped exchange</span>
  </div>
  <img src="/swamp-key.png" alt="SWAMP linking an NRP LLM key to a project · group-bound, auditable, revocable" />
</div>

<div class="slide-footer">
  <span>03 · Use cases · SWAMP</span>
  <span>Project-scoped key · bound to an NRP group</span>
</div>

---
class: tone-cyan
---

<h3>Use case 03 · Yonsei Genome Editing Lab</h3>

# A node contributor <em>also vibe-codes on the cluster.</em>

<div class="usecase">
  <div class="usecase-shot">
    <div class="usecase-shot-bar">
      <span class="terminal-dot r"></span>
      <span class="terminal-dot y"></span>
      <span class="terminal-dot g"></span>
      <span style="margin-left: 0.4rem;">opencode + kimi · debugging DeepBaseEditor</span>
    </div>
    <img src="/ehfd-konsole.png" alt="ehfd · opencode session debugging Python wrappers for DeepBaseEditor" />
  </div>

  <div class="usecase-meta">
    <div class="usecase-attrib">
      <span class="usecase-attrib-avatar"><img src="/ehfd-avatar.png" alt="Seungmin Kim · ehfd on Matrix" /></span>
      <div>
        <div style="font-family: var(--sans); font-size: 0.95rem; font-weight: 600; color: var(--heading);">Seungmin Kim <span style="color: var(--muted); font-weight: 400;">· @ehfd</span></div>
        <div style="font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem;">Yonsei Genome Editing Lab · PI: Hyongbum Henry Kim</div>
      </div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">Who</div>
      <div class="usecase-block-body">Department of Pharmacology, Yonsei University College of Medicine. The lab <strong>contributes a node</strong> back to the federation.</div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">How they use NRP LLMs</div>
      <div class="usecase-block-body"><em>Not for the science itself</em> · for the <strong>tooling around the science</strong>. Wrapper scripts, Python config debugging, conda environments, log triage. <strong>~95% of that codebase is vibe-coded</strong> with kimi + opencode against the NRP gateway.</div>
      <div class="usecase-stack">
        <span class="usecase-stack-pill">opencode</span>
        <span class="usecase-stack-pill">kimi</span>
        <span class="usecase-stack-pill">DeepBaseEditor</span>
        <span class="usecase-stack-pill">DeepPrime</span>
      </div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">Why it lands</div>
      <div class="usecase-block-body">Contributors are users. The same federation that runs your model shipped you the GPU it runs on.</div>
    </div>
  </div>
</div>

<div class="slide-footer">
  <span>03 · Use cases</span>
</div>

---
class: tone-amber
---

<h3>Use case 04 · Vox Deorum · John Chen, U Arizona</h3>

# Civilization V, <em>played by LLMs.</em>

<div class="usecase">
  <div class="usecase-shot">
    <div class="usecase-shot-bar">
      <span class="terminal-dot r"></span>
      <span class="terminal-dot y"></span>
      <span class="terminal-dot g"></span>
      <span style="margin-left: 0.4rem;">vox-deorum-replay · live LLM play</span>
    </div>
    <img src="/vox-replay.gif" alt="Vox Deorum replay · LLM-driven AI players in Civilization V" />
  </div>

  <div class="usecase-meta">
    <div class="usecase-block">
      <div class="usecase-block-label">Who</div>
      <div class="usecase-block-body"><strong>John Chen</strong> · Assistant Professor, <strong>University of Arizona</strong>, College of Information Science.</div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">What it is</div>
      <div class="usecase-block-body">Civilization V opponents driven by LLMs over an MCP server. Architecture: <code>Civ5 ↔ Community Patch DLL ↔ Bridge ↔ MCP ↔ Vox Agents ↔ LLM</code>. Built on Vox Populi.</div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">The research question</div>
      <div class="usecase-block-body">Does <strong>ethical reasoning emerge</strong> when an LLM has to decide whether to launch a nuclear weapon · and which prompt interventions push it which way? Companion benchmark <em>CivBench</em> on arXiv.</div>
      <div class="usecase-stack">
        <span class="usecase-stack-pill">NRP LLMs</span>
        <span class="usecase-stack-pill">MCP</span>
        <span class="usecase-stack-pill">CivBench</span>
        <span class="usecase-stack-pill">Civ V mod</span>
      </div>
    </div>
    <div class="usecase-block">
      <div class="usecase-block-label">Where it lives</div>
      <div class="usecase-block-body"><span class="usecase-url">github.com/vox-deorum/vox-deorum</span> · <span class="usecase-url">arxiv.org/abs/2604.07733</span></div>
    </div>
  </div>
</div>

<div class="slide-footer">
  <span>03 · Use cases</span>
</div>

---
layout: section
class: section
transition: fade
---

## Part 04 · ~2 minutes

# Agentic Coding · Live.

<div class="slide-footer">
  <span>04 · Demo</span>
  <span>One prompt · against the NRP gateway</span>
</div>

---
class: tone-purple
---

<h3>Demo A · what the user sees</h3>

# <code>opencode</code> + <code>minimax-m2</code>, <em>building a flappy bird game at sunset.</em>

<LiveSudoku prebakedSrc="/flappy-prebaked.html" />

<div class="slide-footer">
  <span>04 · Demo · A</span>
  <span>opencode → vLLM → file write → rendered iframe</span>
</div>

---
class: tone-cyan
---

<h3>Before Demo B · the NRP Accounting MCP Server</h3>

# <code>nrp-accounting-mcp</code>, <em>tools an agent can call.</em>

<div class="mcp-explain">
  <div class="mcp-explain-row">
    <div class="mcp-explain-step">
      <div class="mcp-explain-num">01</div>
      <div class="mcp-explain-title">Model Context Protocol</div>
      <div class="mcp-explain-body">An open standard that lets language models call <strong>typed tools</strong> served by a remote process · same idea as a function-call API, but discoverable.</div>
    </div>
    <div class="mcp-explain-step">
      <div class="mcp-explain-num">02</div>
      <div class="mcp-explain-title">NRP runs one</div>
      <div class="mcp-explain-body"><code>nrp-accounting-mcp.nrp-nautilus.io</code> exposes the cluster's accounting database. Tools like <code>top_resource_consumers</code> and <code>get_latest_data_date</code>.</div>
    </div>
    <div class="mcp-explain-step">
      <div class="mcp-explain-num">03</div>
      <div class="mcp-explain-title">Agent figures it out</div>
      <div class="mcp-explain-body">You ask "who's using the most GPU lately?" · the agent picks the right tool, supplies the dates, formats the answer. No SQL, no schema lookup.</div>
    </div>
  </div>
  <div class="mcp-explain-doc">
    Full docs: <strong>nrp.ai/documentation/userdocs/ai/accounting-mcp/</strong>
  </div>
</div>

<div class="slide-footer">
  <span>04 · Demo · B preface</span>
</div>

---
class: tone-purple
---

<h3>Demo B · agent queries the cluster</h3>

# Same agent, <em>now talking to NRP itself.</em>

<LiveMcpDemo prebakedSrc="/mcp-prebaked.json" />

<div class="slide-footer">
  <span>04 · Demo · B</span>
  <span>opencode → MCP (nrp-accounting) → ClickHouse → live answer</span>
</div>

---
class: cover-globe
transition: view-transition
---

# Questions?

<ul class="qa-links">
  <li>NRP managed LLMs · <strong>nrp.ai/documentation/userdocs/ai/llm-managed</strong></li>
  <li>Token at · <strong>nrp.ai/llmtoken</strong></li>
  <li>Usage at · <strong>grafana.nrp-nautilus.io</strong></li>
</ul>

<div class="cover-meta">
  <span>Speaker
    <strong>Mohammad Firas Sada</strong>
  </span>
  <span>Email
    <strong>mfsada@ucsd.edu</strong>
  </span>
</div>

<!--
=========================================================================
SPEAKER NOTES · NOT VISIBLE ON PROJECTOR
Audience plant questions for Q&A (drawn from Part 1).
Pick 2–3 to seed with friendly attendees beforehand. These are tuned to
land specific points in front of the boss.
=========================================================================

1. "How does the NRP managed-LLM stack compare to commercial inference
    (Together, Fireworks, Bedrock) on cost-per-million-tokens, model
    breadth, and time-to-availability for new open-weights releases?"
    → Lets you say: Qwen3.5, Kimi-K2.6, MiniMax-M2.7, GLM-4.7 all live
      within weeks of release. Free for the user. SDSC + Internet2
      affiliates get 2× concurrency. Boss-friendly framing: NRP is a
      strategic alternative, not a free toy.

2. "The cache_salt mechanism is interesting · how much of vLLM's GPU time
    is reclaimed by prefix caching at the gateway level, and is that
    measurable per user?"
    → Lets you talk engineering depth. Distinguishes NRP from "OpenAI
      wrapper" services. Boss likes "we are building real infra."

3. "You showed federated GPUs across UCSD, Mizzou, OSU, Fresno State,
    Sacramento State and others · what's the operational story when a
    site goes down vs. centralized clouds?"
    → Lets you discuss the federation moat: BackendTrafficPolicy retry,
      multi-replica StatefulSets, scaled-to-zero GH200 reserves. Boss
      likes "we have operational maturity AND a moat."

4. "What's the path from open-weights inference today to fine-tuning or
    serving custom models on NRP tomorrow · same gateway?"
    → Lets you forward-position: yes, the same Envoy + AIGatewayRoute
      pattern absorbs custom models in project namespaces. Boss likes
      "this stack scales beyond inference."

5. "Authentik + group flags is unusual · what's the operational benefit
    over per-user API keys like commercial services?"
    → Lets you frame: identity travels end-to-end (cache_salt is hashed
      x-user-id), labs self-organize via groups, admins control LLM flag
      at the group level not user level. Boss likes "we built this
      thoughtfully."

6. "How fast does NRP move on a new SOTA model? You named ten · what's
    the median lag between HF release and NRP availability?"
    → Lets you brag about velocity. Hard to land directly without
      sounding boastful, easy to land via a planted question.

Talking-point ammo if the boss is in the room:
- Gateway is upstream Envoy AI Gateway (CRDs aigateway.envoyproxy.io/v1beta1).
- Per-route timeouts: 1200 s general, 3600 s for long-context qwen.
- StatefulSets per model so RWO model caches don't collide.
- Server-side cache_salt = base64(sha256(x-user-id)) · privacy enforced
  at the gateway, not trust-the-client.
- Token costs recorded as Envoy dynamic metadata, fed to the accounting
  service; surfaced on grafana.nrp-nautilus.io.
- Authentik in the `authentik` namespace fronts all of NRP's identity.
- LLM flag is a group-level boolean in prp/llm-proxy.
=========================================================================
-->
