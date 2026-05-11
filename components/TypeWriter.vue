<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  text: string
  speed?: number       // ms per character
  startDelay?: number  // ms before typing begins
  showCursor?: boolean
}>()

const shown = ref('')
const done = ref(false)

onMounted(() => {
  const speed = props.speed ?? 32
  const startDelay = props.startDelay ?? 250
  setTimeout(() => {
    let i = 0
    const tick = () => {
      if (i < props.text.length) {
        shown.value = props.text.slice(0, i + 1)
        i++
        setTimeout(tick, speed)
      } else {
        done.value = true
      }
    }
    tick()
  }, startDelay)
})
</script>

<template>
  <span class="typewriter">{{ shown }}<span v-if="(showCursor !== false) && !done" class="caret">▍</span></span>
</template>

<style scoped>
.typewriter { display: inline; }
.caret {
  display: inline-block;
  margin-left: 0.05em;
  color: var(--primary, #0161ef);
  animation: tw-blink 0.85s steps(2) infinite;
}
@keyframes tw-blink {
  0%, 50%      { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}
</style>
