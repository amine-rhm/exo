<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { UEDAO } from '@/domain/does/UEDAO';
import type { IUE } from '@/domain/entities/Ue';
import { UE } from '@/domain/entities/Ue';
import CustomButton from '@/presentation/components/forms/components/customButton.vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import UeForm from '@/presentation/components/forms/UeForme.vue';

const ueList = ref<IUE[]>([]);
const ueFormRef = ref();
const selectedUe = ref<UE | null>(null);

// Charger la liste des UE
const loadUeList = async () => {
  try {
    ueList.value = await UEDAO.getInstance().list();
  } catch (error) {
    console.error('Erreur chargement UE:', error);
    alert('Erreur lors du chargement des UE');
  }
};

// Ouvrir le formulaire pour créer une nouvelle UE
const openCreateForm = () => {
  selectedUe.value = null;
  ueFormRef.value?.openForm();
};

// Ouvrir le formulaire pour éditer une UE
const openEditForm = (ue: IUE) => {
  selectedUe.value = new UE(ue.ID, ue.Intitule, ue.NumeroUe, ue.Parcours);
  ueFormRef.value?.openForm(selectedUe.value);
};

// Supprimer une UE
const deleteUe = async (id: number | null) => {
  if (!id) return;
  
  if (confirm('Êtes-vous sûr de vouloir supprimer cette UE ?')) {
    try {
      await UEDAO.getInstance().delete(id);
      alert('UE supprimée avec succès');
      await loadUeList();
    } catch (error: any) {
      alert(error.message);
    }
  }
};

// Événement après création d'une UE
const handleCreateUe = async () => {
  await loadUeList();
};

// Événement après modification d'une UE
const handleUpdateUe = async () => {
  await loadUeList();
};

// Charger les données au montage du composant
onBeforeMount(async () => {
  await loadUeList();
});
</script>

<template>
  <div class="container-fluid p-4">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="mb-0">Liste des UE</h2>
        <CustomButton 
          :color="BootstrapButtonEnum.primary" 
          @click="openCreateForm"
        >
          Ajouter une UE
        </CustomButton>
      </div>
      
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Edition</th>
                <th>ID</th>
                <th>Numéro UE</th>
                <th>Intitulé</th>
                <th>Parcours</th>
                <th>Suppression</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="ueList.length === 0">
                <td colspan="6" class="text-center text-muted">
                  Aucune UE trouvée. Cliquez sur "Ajouter une UE" pour commencer.
                </td>
              </tr>
              <tr v-for="ue in ueList" :key="ue.ID ?? 0">
                <!-- Bouton édition -->
                <td>
                  <button 
                    class="btn btn-link text-primary p-0" 
                    @click="openEditForm(ue)"
                    title="Modifier"
                  >
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                </td>
                
                <!-- ID -->
                <td>{{ ue.ID }}</td>
                
                <!-- Numéro UE -->
                <td>{{ ue.NumeroUe }}</td>
                
                <!-- Intitulé -->
                <td>{{ ue.Intitule }}</td>
                
                <!-- Parcours (liste) -->
                <td>
                  <span v-if="!ue.Parcours || ue.Parcours.length === 0" class="text-muted">
                    Aucun parcours
                  </span>
                  <div v-else>
                    <span 
                      v-for="(parcours) in ue.Parcours" 
                      :key="parcours.ID ?? 0"
                      class="badge bg-info me-1"
                    >
                      {{ parcours.NomParcours }}
                    </span>
                  </div>
                </td>
                
                <!-- Bouton suppression -->
                <td>
                  <button 
                    class="btn btn-link text-danger p-0" 
                    @click="deleteUe(ue.ID)"
                    title="Supprimer"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Formulaire modal UE -->
    <UeForm 
      ref="ueFormRef"
      :ue="selectedUe"
      @create:ue="handleCreateUe"
      @update:ue="handleUpdateUe"
    />
  </div>
</template>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.table th {
  font-weight: 600;
  color: #495057;
  background-color: #f8f9fa;
}

.btn-link {
  text-decoration: none;
  font-size: 1.2rem;
}

.btn-link:hover {
  opacity: 0.7;
}

.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}
</style>