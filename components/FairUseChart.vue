<script setup lang="ts">
const rows = [
  { model: 'kimi',            base: 2,  tone: 'amber'  },
  { model: 'glm-4.7',         base: 4,  tone: 'purple' },
  { model: 'minimax-m2',      base: 4,  tone: 'purple' },
  { model: 'qwen3-small',     base: 8,  tone: 'cyan'   },
  { model: 'gemma',           base: 8,  tone: 'green'  },
  { model: 'gemma-small',     base: 8,  tone: 'green'  },
  { model: 'olmo',            base: 8,  tone: 'rose'   },
  { model: 'qwen3',           base: 16, tone: 'blue'   },
  { model: 'gpt-oss',         base: 16, tone: 'blue'   },
  { model: 'qwen3-embedding', base: 16, tone: 'blue'   },
]
const max = 32 // SDSC/I2 doubled cap on the highest tier
</script>

<template>
  <div class="fair-use">
    <div class="fair-use-axis">
      <span>0</span><span>8</span><span>16</span><span>24</span><span>32</span>
    </div>
    <div v-for="r in rows" :key="r.model" class="fair-use-row" :data-tone="r.tone">
      <div class="fair-use-name">{{ r.model }}</div>
      <div class="fair-use-track">
        <div class="fair-use-bar" :style="{ width: ((r.base / max) * 100) + '%' }">
          <span class="fair-use-bar-v">{{ r.base }}</span>
        </div>
        <div class="fair-use-bar fair-use-bar-extra" :style="{ left: ((r.base / max) * 100) + '%', width: ((r.base / max) * 100) + '%' }">
          <span class="fair-use-bar-v">+{{ r.base }}</span>
        </div>
      </div>
    </div>
    <div class="fair-use-legend">
      <span class="fair-use-legend-item"><span class="fair-use-swatch base"></span>Standard</span>
      <span class="fair-use-legend-item"><span class="fair-use-swatch extra"></span>SDSC / Internet2 (2×)</span>
    </div>
  </div>
</template>

<style scoped>
.fair-use {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-family: var(--sans, 'Inter', sans-serif);
}

.fair-use-axis {
  display: grid;
  grid-template-columns: 9rem repeat(4, 1fr);
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted, rgba(229, 236, 246, 0.66));
  margin-left: 9rem;
  width: calc(100% - 9rem);
  position: relative;
}

.fair-use-axis span {
  text-align: left;
}

.fair-use-row {
  display: grid;
  grid-template-columns: 9rem 1fr;
  align-items: center;
  gap: 0.8rem;
}

.fair-use-row[data-tone='blue']   { --tone: #0161ef; --glow: rgba(1,97,239,0.22); }
.fair-use-row[data-tone='purple'] { --tone: #6d28d9; --glow: rgba(109,40,217,0.22); }
.fair-use-row[data-tone='amber']  { --tone: #f5c87d; --glow: rgba(245,200,125,0.22); }
.fair-use-row[data-tone='green']  { --tone: #7bf2c9; --glow: rgba(123,242,201,0.22); }
.fair-use-row[data-tone='rose']   { --tone: #ff8b9c; --glow: rgba(255,139,156,0.22); }
.fair-use-row[data-tone='cyan']   { --tone: #65c9ff; --glow: rgba(101,201,255,0.22); }

.fair-use-name {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--heading, #f7f8f8);
  text-align: right;
}

.fair-use-track {
  position: relative;
  height: 1.4rem;
  background: rgba(229, 236, 246, 0.05);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.1));
}

.fair-use-bar {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--tone);
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
  animation: fairUseBar 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  transform-origin: left center;
  box-shadow: 0 0 14px var(--glow);
}

.fair-use-bar-extra {
  background: var(--tone);
  opacity: 0.35;
  border-left: 1px dashed rgba(255, 255, 255, 0.45);
  border-radius: 0;
  animation-delay: 0.25s;
}

.fair-use-bar-v {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.7rem;
  font-weight: 600;
  color: #02041a;
  letter-spacing: 0.04em;
}

.fair-use-bar-extra .fair-use-bar-v {
  color: var(--heading, #f7f8f8);
  opacity: 0.95;
}

.fair-use-legend {
  display: flex;
  gap: 1.6rem;
  margin-top: 0.6rem;
  margin-left: 9.8rem;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted, rgba(229, 236, 246, 0.66));
}

.fair-use-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.fair-use-swatch {
  display: inline-block;
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 3px;
}

.fair-use-swatch.base {
  background: #0161ef;
  box-shadow: 0 0 8px rgba(1, 97, 239, 0.4);
}

.fair-use-swatch.extra {
  background: #0161ef;
  opacity: 0.35;
  border: 1px dashed rgba(255, 255, 255, 0.5);
}

@keyframes fairUseBar {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
</style>
