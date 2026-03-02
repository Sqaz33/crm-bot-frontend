<template>
  <div class="staff-card" @click="$emit('select')">
    <div class="avatar-container" @click.stop="$emit('avatar-click')">
      <div
        v-if="staff.photo"
        class="avatar"
        :style="{ backgroundImage: `url(${staff.photo})` }"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="$emit('avatar-click')"
        @keydown.space.prevent="$emit('avatar-click')"
      />
      <div
        v-else
        class="avatar avatar--empty"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="$emit('avatar-click')"
        @keydown.space.prevent="$emit('avatar-click')"
      >
        <span class="avatar-letter">{{ firstLetter }}</span>
      </div>
    </div>

    <div class="staff-info">
      <div class="staff-name">{{ staff.name }}</div>
      <div class="staff-position">{{ staff.specializations.join(', ') }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  staff: {
    type: Object,
    required: true,
  },
})

defineEmits(['select', 'avatar-click'])

const firstLetter = computed(() => {
  const name = props.staff.name
  return name && name.length > 0 ? name.charAt(0).toUpperCase() : ''
})
</script>

<style scoped>
.staff-card {
  display: flex;
  align-items: center;
  width: 100%;
  height: 96px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-sizing: border-box;
}

.staff-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  margin-right: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar--empty {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #69ffdb 0%, #69ff03 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.avatar-letter {
  font-family: "Geometria", sans-serif;
  font-weight: 600;
  font-size: 28px;
  line-height: 33px;
  color: #ffffff;
}

.staff-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.staff-name {
  font-family: "Geometria", sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  color: #454558;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.staff-position {
  font-family: "Geometria", sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  color: #454558;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .staff-card {
    height: 72px;
    padding: 8px 12px;
  }

  .avatar-container {
    margin-right: 12px;
  }

  .avatar,
  .avatar--empty {
    width: 40px;
    height: 40px;
  }

  .avatar-letter {
    font-size: 16px;
    line-height: 20px;
  }

  .staff-name {
    font-size: 14px;
    line-height: 18px;
  }

  .staff-position {
    font-size: 12px;
    line-height: 16px;
  }
}
</style>
