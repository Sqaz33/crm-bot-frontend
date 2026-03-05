<!-- Спиннер загрузки: SVG-дуга с dash-анимацией.
     Цвет наследуется через currentColor — задавайте text-* на родителе. -->
<template>
  <svg
    class="w-8 h-8 spinner-rotate"
    viewBox="0 0 50 50"
    role="status"
    aria-label="Загрузка"
  >
    <circle
      class="spinner-arc"
      cx="25" cy="25" r="20"
      fill="none"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.spinner-rotate {
  animation: rot 900ms linear infinite;
}

/* stroke-dasharray анимация — невозможна через Tailwind */
.spinner-arc {
  stroke-dasharray: 1, 200;
  animation: dash 900ms ease-in-out infinite;
}

@keyframes rot {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0%   { stroke-dasharray: 1, 200;  stroke-dashoffset: 0; }
  50%  { stroke-dasharray: 90, 200; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 200; stroke-dashoffset: -125; }
}
</style>
