<template>
  <header class="main-header">
    <div class="salon-info">
      <div class="salon-logo">
        <img src="@/assets/logo.svg" alt="Логотип" />
      </div>
      <div class="salon-text">
        <div class="salon-name">{{ salon.name }}</div>
        <div class="salon-desc">{{ salon.description }}</div>
      </div>
    </div>

    <nav class="menu">
      <div
        v-for="item in items"
        :key="item.label"
        class="menu-item"
        @click="navigate(item)"
      >
        <img :src="item.icon" alt="" />
        <span>{{ item.label }}</span>
      </div>
    </nav>

    <Modal :visible="showShareModal" @close="showShareModal = false">
      <ShareModal />
    </Modal>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../api";
import { logger } from "../../utils/logger";

import Modal from "../ui/Modal.vue";
import ShareModal from "../Modal/ShareModal.vue"

import AddressIcon from "@/assets/map.svg";
import RecordsIcon from "@/assets/appointment.svg";
import ShareIcon from "@/assets/share.svg";
import ProfileIcon from "@/assets/prof.svg";

const router = useRouter();
const showShareModal = ref(false);

const salon = ref({
  name: "",
  description: "",
  address_url: "",
});

onMounted(async () => {
  try {
    const { data } = await api.get("/salon/info/");
    salon.value = {
      name: data.name,
      description: data.description || "",
      address_url: data.address_url || "",
    };
  } catch {
    salon.value = {
      name: "Ошибка загрузки",
      description: "",
      address_url: "",
    };
  }
});

const items = [
  { label: "Адрес", path: "/address", icon: AddressIcon },
  { label: "Записи", path: "/records", icon: RecordsIcon },
  { label: "Поделиться", path: "/share", icon: ShareIcon },
  { label: "Профиль", path: "/profile", icon: ProfileIcon },
];

function navigate(item) {
  if (item.label === "Адрес") {
    if (salon.value.address_url) {
      const win = window.open(salon.value.address_url, "_blank");
      if (win) win.opener = null;
    } else {
      logger.warn('MainMenu: ссылка на адрес недоступна');
    }
  } else if (item.label === "Поделиться") {
    showShareModal.value = true;
  } else {
    router.push(item.path);
  }
}
</script>

<style scoped>
.main-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #FFFFFF;
  box-shadow: 3px 0px 9px 0px rgba(0, 0, 0, 0.04);
}

/* Верхняя часть: логотип + название + тип заведения */
.salon-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.salon-logo {
  flex-shrink: 0;
}

.salon-logo img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #6267ee;
  padding: 6px;
  display: block;
}

.salon-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.salon-name {
  font-family: 'Geometria', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #454558;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.salon-desc {
  font-family: 'Geometria', sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  color: #454558;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Навигация: 4 иконки */
.menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 16px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 65px;
  height: 56px;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.menu-item:hover {
  opacity: 0.7;
}

.menu-item img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.menu-item span {
  font-family: 'Geometria', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: #454558;
  white-space: nowrap;
}
</style>
