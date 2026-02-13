<template>
  <div class="page">
    <h1>Negócios</h1>
    <p>Módulo de gerenciamento de negócios</p>
    <button class="btn">Novo Negócio</button>
    <div class="table-placeholder">
      <p>Tabela de negócios será exibida aqui</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page {
  padding: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.btn:hover {
  background: #1565c0;
}

.table-placeholder {
  border: 1px solid #ddd;
  padding: 2rem;
  border-radius: 4px;
  background: white;
  text-align: center;
  color: #999;
}
</style>
