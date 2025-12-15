<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { EtudiantDAO } from '@/domain/does/Etudiant'; 
import type { IEtudiant} from '@/domain/entities/Etudiant';
import { Etudiant } from '@/domain/entities/Etudiant';
import CustomButton from '@/presentation/components/forms/components/customButton.vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import EtudinatFome from '@/presentation/components/forms/EtudinatFome.vue';

const etudiantList = ref<IEtudiant[]>([]);
const etudiantFormRef = ref();
const selectedEtudiant = ref<Etudiant | null>(null);

// Charger la liste des étudiants
const loadEtudiantList = async () => {
  try {
    etudiantList.value = await EtudiantDAO.getInstance().list();
  } catch (error) {
    console.error('Erreur chargement étudiants:', error);
    alert('Erreur lors du chargement des étudiants');
  }
};

// Ouvrir le formulaire pour créer un nouvel étudiant
const openCreateForm = () => {
  selectedEtudiant.value = null;
  etudiantFormRef.value?.openForm();
};

// Ouvrir le formulaire pour éditer un étudiant
const openEditForm = (etudiant: IEtudiant) => {
  selectedEtudiant.value = new Etudiant(etudiant.ID, etudiant.Nom, etudiant.Prenom, etudiant.Email, etudiant.Parcours);
  etudiantFormRef.value?.openForm(selectedEtudiant.value);
};

// Supprimer un étudiant
const deleteEtudiant = async (id: number | null) => {
  if (!id) return;
  
  if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
    try {
      await EtudiantDAO.getInstance().delete(id);
      alert('Étudiant supprimé avec succès');
      await loadEtudiantList();
    } catch (error: any) {
      alert(error.message);
    }
  }
};

// Événement après création d'un étudiant
const handleCreateEtudiant = async () => {
  await loadEtudiantList();
};

// Événement après modification d'un étudiant
const handleUpdateEtudiant = async () => {
  await loadEtudiantList();
};

// Charger les données au montage du composant
onBeforeMount(async () => {
  await loadEtudiantList();
});
</script>

<template>
  <div class="container-fluid p-4">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="mb-0">Liste des Étudiants</h2>
        <CustomButton 
          :color="BootstrapButtonEnum.primary" 
          @click="openCreateForm"
        >
          Ajouter un étudiant
        </CustomButton>
      </div>
      
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Edition</th>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Parcours</th>
                <th>Suppression</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="etudiantList.length === 0">
                <td colspan="7" class="text-center text-muted">
                  Aucun étudiant trouvé. Cliquez sur "Ajouter un étudiant" pour commencer.
                </td>
              </tr>
              <tr v-for="etudiant in etudiantList" :key="etudiant.ID ?? 0">
                <!-- Bouton édition -->
                <td>
                  <button 
                    class="btn btn-link text-primary p-0" 
                    @click="openEditForm(etudiant)"
                    title="Modifier"
                  >
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                </td>
                
                <!-- ID -->
                <td>{{ etudiant.ID }}</td>
                
                <!-- Nom -->
                <td>{{ etudiant.Nom }}</td>
                
                <!-- Prénom -->
                <td>{{ etudiant.Prenom }}</td>
                
                <!-- Email -->
                <td>{{ etudiant.Email }}</td>
                
                <!-- Parcours -->
                <td>
                  <span v-if="!etudiant.Parcours" class="text-muted">
                    Aucun parcours
                  </span>
                  <span v-else class="badge bg-info">
                    {{ etudiant.Parcours.NomParcours }}
                  </span>
                </td>
                
                <!-- Bouton suppression -->
                <td>
                  <button 
                    class="btn btn-link text-danger p-0" 
                    @click="deleteEtudiant(etudiant.ID)"
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

    <!-- Formulaire modal étudiant -->
    <EtudinatFome 
      ref="etudiantFormRef"
      :etudiant="selectedEtudiant"
      @create:etudiant="handleCreateEtudiant"
      @update:etudiant="handleUpdateEtudiant"
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