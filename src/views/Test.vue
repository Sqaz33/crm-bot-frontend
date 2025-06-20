<template>
    <div>
      <Header>
        <template #actions>
          <button @click="open = true">Открыть карточку</button>
        </template>
      </Header>
  
      <Modal :visible="open" @close="open = false">
        <Card>
          <template #header>
            <h3>Профиль сотрудника</h3>
          </template>
          <template #body>
            <p>Имя: Ночная бабочка</p>
            <p>Должность: Сосалка</p>
            <p>Стаж: 4 года</p>
          </template>
          <template #footer>
            <button @click="open = false">Закрыть</button>
          </template>
        </Card>
      </Modal>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import Header from '../components/Header.vue'
  import Modal from '../components/Modal.vue'
  import Card from '../components/Card.vue'
  
  const open = ref(false)
  </script>
  
  <style scoped>
  button {
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    background-color: #444;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>
  