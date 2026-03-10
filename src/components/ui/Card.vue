<template>
    <div class="card">
      <div class="card-header">
        <slot name="header" />
      </div>
      <div class="card-body">
        <slot name="body" />
      </div>
      <div class="card-footer">
        <slot name="footer" />
      </div>
    </div>
  </template>
  
  <style scoped>
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
  
  .card-header,
  .card-footer {
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .card-body {
    font-size: 0.95rem;
  }
  </style>
  