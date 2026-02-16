<template>
    <div class="flex flex-col items-center gap-3">
  <button class="tc_button tc_button--ok" @click="moveVisit">
    Перенести запись
  </button>

  <button class="tc_button tc_button--cancel" @click="cancelVisit">
    Отменить запись
  </button>
</div>

<div class="flex justify-center mt-6">
  <button class="r_button" :disabled="!selectedTime" @click="bookTime">
    Занять
  </button>
</div>
<br>
<div class="flex content-center gap-3 w-full max-w-[375px]">
  <button class="s_button s_button--yes flex-1">Да, отменить</button>
  <button class="s_button s_button--no flex-1">Отмена</button>
</div>

</template>