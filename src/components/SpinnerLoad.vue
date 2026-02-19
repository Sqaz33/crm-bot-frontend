<!-- <div v-if="loading" class="loading">
  <SpinnerSvg style="color: var(--brand)" />
</div> -->


<template>
  <svg class="spinner" viewBox="0 0 50 50" role="status" aria-label="Загрузка">
    <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
  </svg>
</template>

<style scoped>
.spinner { display:flex;justify-content: center; width: 32px; height: 32px; animation: rot 900ms linear infinite; }
.spinner-path {
  stroke: currentColor;
  stroke-linecap: round;
  stroke-dasharray: 1, 200;
  animation: dash 900ms ease-in-out infinite;
}
@keyframes rot { 100% { transform: rotate(360deg); } }
@keyframes dash {
  0% { stroke-dasharray: 1,200; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90,200; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90,200; stroke-dashoffset: -125; }
}
</style>
