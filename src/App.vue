<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './presentation/components/navigation/NavBar.vue'
</script>

<template>
  <main>
    <div class="application d-flex flex-nowrap">
      <NavBar />
      <RouterView class="content" />
    </div>
  </main>
</template>

<style scoped>
main {
  overflow-x: auto;
  overflow-y: hidden;
}

main .application {
  width: 100%;
  height: 100vh;
}

.content {
  height: 100vh;
  flex-grow: 1;
}
</style>

<style scoped> 
.custom-modal { 
  position: absolute; 
  left: 0; 
  top: 0; 
  height: 100%; 
  width: 100%; 
  background-color: rgba(87, 86, 86, 0.5); 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  text-align: center; 
} 

.custom-modal .card { 
  width: 250px; 
} 

.card-header { 
  background: #273656; 
  color: white; 
  text-align: left; 
} 

.card-text { 
  text-align: left; 
} 
</style> 
