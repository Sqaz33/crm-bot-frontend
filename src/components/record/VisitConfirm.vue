<template>
  <div v-if="!isOld" class="section" :class="{ 'section-disabled': willCome || delete_ }">
    <div class="section-bar">Я точно приду</div>
    <div class="toggle-row">
      <div class="hint">Нажимая, вы подтверждаете свой визит</div>
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
.section{margin-bottom:12px;max-width:100%;}
.section-disabled{
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.section-bar{
  background:var(--primary);color:#8097B1;font-weight:400;
  padding:10px 12px;border-radius:10px 10px 0 0;
  letter-spacing:.02em;text-transform:uppercase;
}
.toggle-row{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  background:#fff;border:1px solid var(--divider);border-top:none;
  border-radius:0 0 12px 12px;padding:12px;max-width:100%;
}
.toggle{position:relative;display:inline-block;width:46px;height:28px;flex:0 0 auto}
.toggle input{opacity:0;width:0;height:0}
.slider{
  position:absolute;inset:0;background:#D9DDE4;border-radius:999px;transition:.2s;
  overflow:clip; /* не даём тени кружка выходить */
}
.slider:before{
  content:"";position:absolute;left:3px;top:3px;width:22px;height:22px;background:#fff;border-radius:50%;
  box-shadow:0 1px 3px rgba(0,0,0,.2);transition:.2s
}
.toggle input:checked + .slider{background:#3ccb78}
.toggle input:checked + .slider:before{transform:translateX(18px)}
</style>