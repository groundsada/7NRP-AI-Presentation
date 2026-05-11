<script setup lang="ts">
defineProps<{
  name: string
  alias?: string
  size: string
  context: string
  status?: 'supported' | 'evaluating'
  caps?: string[]
  tone?: 'blue' | 'purple' | 'amber' | 'green' | 'rose' | 'cyan'
}>()
</script>

<template>
  <div class="model-card" :data-tone="tone || 'blue'" :data-status="status || 'supported'">
    <div class="model-card-head">
      <div class="model-card-mark">{{ name.charAt(0).toUpperCase() }}</div>
      <div class="model-card-titles">
        <div class="model-card-name">{{ name }}<span v-if="alias"> · {{ alias }}</span></div>
        <div class="model-card-status">{{ status || 'supported' }}</div>
      </div>
    </div>
    <div class="model-card-stats">
      <div class="model-card-stat">
        <div class="model-card-stat-v">{{ size }}</div>
        <div class="model-card-stat-l">params</div>
      </div>
      <div class="model-card-stat">
        <div class="model-card-stat-v">{{ context }}</div>
        <div class="model-card-stat-l">context</div>
      </div>
    </div>
    <div class="model-card-caps" v-if="caps && caps.length">
      <span v-for="c in caps" :key="c" class="model-card-cap">{{ c }}</span>
    </div>
  </div>
</template>

<style scoped>
.model-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.85rem 1rem 0.95rem;
  border: 1px solid var(--panel-border, rgba(229, 236, 246, 0.14));
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(229, 236, 246, 0.04), rgba(229, 236, 246, 0.015));
  overflow: hidden;
}

.model-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  background: var(--tone, #0161ef);
  opacity: 0.85;
}

.model-card[data-tone='blue']    { --tone: #0161ef; --glow: rgba(1,97,239,0.22); }
.model-card[data-tone='purple']  { --tone: #6d28d9; --glow: rgba(109,40,217,0.22); }
.model-card[data-tone='amber']   { --tone: #f5c87d; --glow: rgba(245,200,125,0.22); }
.model-card[data-tone='green']   { --tone: #7bf2c9; --glow: rgba(123,242,201,0.22); }
.model-card[data-tone='rose']    { --tone: #ff8b9c; --glow: rgba(255,139,156,0.22); }
.model-card[data-tone='cyan']    { --tone: #65c9ff; --glow: rgba(101,201,255,0.22); }

.model-card[data-status='evaluating'] { border-style: dashed; }

.model-card-head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.model-card-mark {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--sans, 'Inter', sans-serif);
  font-weight: 700;
  font-size: 1rem;
  color: var(--heading, #f7f8f8);
  background: var(--tone);
  box-shadow: 0 0 18px var(--glow);
}

.model-card-titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.model-card-name {
  font-family: var(--sans, 'Inter', sans-serif);
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--heading, #f7f8f8);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card-status {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.55rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted, rgba(229, 236, 246, 0.66));
  margin-top: 0.1rem;
}

.model-card-stats {
  display: flex;
  gap: 1rem;
  align-items: baseline;
}

.model-card-stat {
  display: flex;
  flex-direction: column;
}

.model-card-stat-v {
  font-family: var(--sans, 'Inter', sans-serif);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--heading, #f7f8f8);
  letter-spacing: -0.02em;
  line-height: 1;
}

.model-card-stat-l {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.55rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted, rgba(229, 236, 246, 0.66));
  margin-top: 0.25rem;
}

.model-card-caps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.1rem;
}

.model-card-cap {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.56rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tone);
  padding: 0.18rem 0.48rem;
  border: 1px solid var(--tone);
  border-radius: 999px;
  background: var(--glow);
}
</style>
