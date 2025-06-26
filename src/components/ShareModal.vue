<template>
    <div class="share-container">
      <p class="share-title" style="color: black;">Выберите, где вы хотите поделиться</p>
      <div class="share-icons">
        <a
          v-for="item in shareItems"
          :key="item.name"
          :href="item.url"
          class="share-btn"
          target="_blank"
          rel="noopener"
        >
          <i :class="item.iconClass"></i>
        </a>
      </div>
    </div>
  </template>
  
  <script setup>
  const botUsername = '@CheckAuthorization_bot'
  const botLink = `https://t.me/CheckAuthorization_bot`
  const shareText = encodeURIComponent(`Попробуй Telegram-бота ${botUsername}`)
  const urlEncoded = encodeURIComponent(botLink)
  
  const shareItems = [
    {
      name: 'Telegram',
      iconClass: 'icon-telegram',
      url: `https://t.me/share/url?url=${urlEncoded}&text=${shareText}`,
    },
    {
      name: 'WhatsApp',
      iconClass: 'icon-whatsapp',
      url: `https://wa.me/?text=${shareText}%20${urlEncoded}`,
    },
    {
      name: 'Viber',
      iconClass: 'icon-viber',
      url: `viber://forward?text=${shareText}%20${urlEncoded}`,
    },
    {
      name: 'VK',
      iconClass: 'icon-vk',
      url: `https://vk.com/share.php?url=${urlEncoded}`,
    },
    {
      name: 'OK',
      iconClass: 'icon-odnoklassniki',
      url: `https://connect.ok.ru/offer?url=${urlEncoded}&title=${shareText}`,
    },
    {
      name: 'X',
      iconClass: 'icon-x',
      url: `https://twitter.com/intent/tweet?text=${shareText}%20${urlEncoded}`,
    },
    {
      name: 'Skype',
      iconClass: 'icon-skype',
      url: `https://web.skype.com/share?url=${urlEncoded}&text=${shareText}`,
    },
  ]
  </script>
  
  <style scoped>
  .share-container {
    text-align: center;
  }
  
  .share-title {
    margin-bottom: 1rem;
    font-weight: bold;
  }
  
  .share-icons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .share-btn {
    width: 48px;
    height: 48px;
    background-color: #eee;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    text-decoration: none;
    color: black;
  }
  </style>
  