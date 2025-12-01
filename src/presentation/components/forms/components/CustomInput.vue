<script setup lang="ts">
const model = defineModel();

const props = defineProps<{ 
  id: string, 
  libelle: string, 
  type: string, 
  placeholder: string | undefined, 
  error?: string | null, 
}>();
</script>

<template>
    <div class="form-group">
        <label for="intitule">{{ libelle }} :</label>
        <input v-model="model" class="form-control" :type="type" :id="id" :placeholder="placeholder" />
        <small v-if="error" class="text-danger">{{ error }}</small>
    </div>
</template>