<template>
  <transition name="slide-up">
    <div class="terms-modal" v-if="visible">
      <div class="terms-modal-content">
        <div class="terms-modal-header">
          <span>УСЛОВИЯ ИСПОЛЬЗОВАНИЯ СЕРВИСА «ОНЛАЙН-ЗАПИСЬ»</span>
          <button class="close-btn" @click="close">&times;</button>
        </div>
        <div class="terms-modal-body">
          <slot>
            <p>
              Полные условия использования приложения и обработки ваших данных изложены по следующим ссылкам:
            </p>
            <ul class="terms-links">
              <li>
                Политика конфиденциальности:
                <a href="https://zabot.org/politics" target="_blank" rel="noopener noreferrer">
                  https://zabot.org/politics
                </a>
              </li>
              <li>
                Пользовательское соглашение:
                <a href="https://zabot.org/oferta" target="_blank" rel="noopener noreferrer">
                  https://zabot.org/oferta
                </a>
              </li>
            </ul>
          </slot>
        </div>
      </div>
      <div class="terms-modal-overlay" @click="close"></div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emits = defineEmits(['close'])
function close() {
  emits('close')
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(.17,.67,.83,.67);
}
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
.slide-up-enter-to, .slide-up-leave-from { transform: translateY(0); opacity: 1; }

.terms-modal {
  position: fixed;
  left: 0; right: 0; bottom: 0; top: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.terms-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.18);
  z-index: 0;
}
.terms-modal-content {
  width: 100vw;
  max-width: 100%;
  max-height: 95vh;
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 2px 16px rgba(50,54,73,0.12);
  padding: 0;
  position: relative;
  z-index: 1;
  animation: slideUp 0.33s;
  display: flex;
  flex-direction: column;
}
@keyframes slideUp {
  from { transform: translateY(100%);}
  to { transform: translateY(0);}
}
.terms-modal-header {
  padding: 20px 36px 12px 24px;
  border-bottom: 1px solid #e8e9ed;
  font-weight: 600;
  font-size: 1.16em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.terms-modal-body {
  padding: 16px 28px 28px 28px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  font-size: 0.98em;
  color: #222;
  flex: 1;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.terms-links { padding-left: 1.2em; margin: 0.6em 0 0; }
.terms-links li { margin: 0.35em 0; }
.terms-modal-body a { text-decoration: underline; }

.close-btn {
  background: none;
  border: none;
  font-size: 2em;
  color: #555;
  cursor: pointer;
  margin-left: 10px;
  line-height: 1;
}
@media (max-width:600px) {
  .terms-modal-body { padding: 16px 12px 22px 12px; }
  .terms-modal-header { padding: 18px 18px 8px 14px; }
}
</style>
