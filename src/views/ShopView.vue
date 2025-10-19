<template>
  <div class="base">
      
    <main class="empty-content">
      <img src="../assets/PercentShop.svg" alt="Пустой магазин" class="empty-icon" />
      <p1>Магазин скоро откроется</p1>
      <p2>Скоро Вы сможете что-то купить...</p2>        
    </main>

</script>

<style>

.empty-content 
{
  display: flex;
  padding:6rem;
  flex: 1;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
}

.empty-content p1 
{
  font-size: clamp(0.75rem, 4vw, 1.2rem);
}

.empty-content p2
{
  font-size: clamp(0.6rem, 3vw, 1rem);
}


.empty-icon
{
  margin-bottom: 1rem;
  width:clamp(6.7rem, 10vw, 8rem);
  height: clamp(6.7rem, 10vw, 8rem);
  
}

@media (max-width: 768px) 
{
  .empty-content 
  {
    padding-right: 3rem; 
  }
}

</style>
