<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  from?: number
  to: number
  suffix?: string
  prefix?: string
  label: string
  duration?: number
  decimals?: number
}>()

const value = ref(props.from ?? 0)

onMounted(() => {
  const start = performance.now()
  const dur = props.duration ?? 1400
  const from = props.from ?? 0
  const to = props.to
  function tick(now: number) {
    const t = Math.min((now - start) / dur, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    value.value = from + (to - from) * eased
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

function fmt(n: number) {
  const d = props.decimals ?? 0
  return n.toFixed(d)
}
</script>

<template>
  <div class="stat">
    <div class="stat-value">
      <span class="stat-prefix" v-if="prefix">{{ prefix }}</span>{{ fmt(value) }}<span class="stat-suffix" v-if="suffix">{{ suffix }}</span>
    </div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-left: 2px solid var(--primary, #0161ef);
  padding-left: 1.4rem;
}
.stat-value {
  font-family: var(--sans, 'Inter', sans-serif);
  font-weight: 700;
  font-size: 4.4rem;
  line-height: 1;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, var(--primary, #0161ef) 0%, var(--accent, #6d28d9) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat-prefix,
.stat-suffix {
  font-size: 0.5em;
}
.stat-label {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted, rgba(229, 236, 246, 0.66));
}
</style>
