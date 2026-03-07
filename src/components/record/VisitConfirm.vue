<template>
  <div v-if="!isOld" class="visit-confirm" :class="{ 'visit-confirm-disabled': willCome || delete_ }">
    <div class="row">
      <div class="info">
        <div class="title">Я точно приду</div>
        <div class="hint">Нажимая, вы подтверждаете свой визит</div>
      </div>
      <label class="toggle">
        <input
          type="checkbox"
          :checked="willCome"
          @change="onWillComeChange"
          :disabled="willCome || processing || delete_"
        />
        <span class="slider"></span>
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOld: {
    type: Boolean,
    required: true
  },
  willCome: {
    type: Boolean,
    required: true
  },
  processing: {
    type: Boolean,
    required: true
  },
  delete_: {
    type: Boolean,
    required: true
  },
  onWillComeChange: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
@config "../../tailwind.config.js";

.visit-confirm { 
  margin-bottom: 12px;
  max-width: 100%;
}
.visit-confirm-disabled {
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.row {
  @apply bg-neutral-0;
  @apply rounded-xl;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  max-width: 100%;
}
.row > .info {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}
.title {
  @apply text-neutral-800;
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hint{
  @apply text-neutral-500;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toggle {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 28px;
  flex: 0 0 auto;
}
.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  inset: 0;
  background: #D9DDE4;
  border-radius: 999px;
  transition: .2s;
  overflow: clip; /* не даём тени кружка выходить */
}
.slider:before {
  content: "";
  position: absolute;
  left: 3px;
  top: 3px;
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
  transition: .2s;
}
.toggle input:checked + .slider { background: #3ccb78 }
.toggle input:checked + .slider:before { transform:translateX(18px) }
</style>