<template>
  <header class="flex flex-col w-full bg-white shadow-[3px_0_9px_0_rgba(0,0,0,0.04)]
                  md:flex-row md:items-center md:justify-between md:h-20">
    <div class="flex items-center gap-3 px-4 py-3
                md:flex-1 md:min-w-0 md:gap-[22px] md:px-[35px] md:py-3.5">
      <div class="shrink-0 cursor-pointer" @click="router.push('/')">
        <img
          :src="salon.logo_url || defaultLogo"
          alt="На главную"
          class="w-10 h-10 rounded-[10px] p-1.5 block object-contain
                 md:w-[60px] md:h-[60px] md:rounded-[10px] md:bg-transparent md:p-0"
        />
      </div>
      <div class="flex flex-col justify-center min-w-0">
        <div class="font-[Geometria,sans-serif] font-normal text-sm leading-5 text-neutral-800 truncate
                    md:text-[30px] md:leading-9">
          {{ salon.name }}
        </div>
        <div class="font-[Geometria,sans-serif] font-normal text-[10px] leading-3 text-neutral-800 truncate
                    md:text-lg md:leading-6">
          {{ salon.description }}
        </div>
      </div>
    </div>

    <nav class="flex items-center justify-between py-1 px-4
                md:shrink-0 md:h-auto md:gap-6 md:justify-end md:px-4 md:py-0
                lg:gap-[150px] lg:px-[100px]">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex flex-col items-center justify-center w-[65px] h-14 gap-1
               cursor-pointer transition-opacity hover:opacity-70"
        @click="navigate(item)"
      >
        <img :src="item.icon" alt="" class="w-8 h-8 shrink-0 md:w-10 md:h-10" />
        <span class="font-[Geometria,sans-serif] font-normal text-sm leading-5 text-center text-neutral-800 whitespace-nowrap
                     md:text-lg md:leading-6">
          {{ item.label }}
        </span>
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
import ShareModal from "../Modal/ShareModal.vue";

import AddressIcon from "@/assets/map.svg";
import RecordsIcon from "@/assets/appointment.svg";
import ShareIcon from "@/assets/share.svg";
import ProfileIcon from "@/assets/prof.svg";
import defaultLogoSrc from "@/assets/logo.svg"; 

const router = useRouter();
const showShareModal = ref(false);
const defaultLogo = defaultLogoSrc;


const salon = ref({
  name: "",
  description: "",
  address_url: "",   
  logo_url: "",      
});

onMounted(async () => {
  try {
    const { data } = await api.get("/salon/info/");
    salon.value = {
      name: data.name,
      description: data.description || "",
      address_url: data.address_url || "", 
      logo_url: data.logo_url || "",       
    };
  } catch {
    salon.value = {
      name: "Ошибка загрузки",
      description: "",
      address_url: "",
      logo_url: "",
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

