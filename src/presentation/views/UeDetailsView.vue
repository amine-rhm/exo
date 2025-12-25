<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { UEDAO } from '@/domain/does/UEDAO';
import { ParcoursDAO } from '@/domain/does/ParcoursDAO';
import { EtudiantDAO } from '@/domain/does/Etudiant';
import { NoteDAO } from '@/domain/does/NoteDAO';
import type { IUE } from '@/domain/entities/Ue';
import type { Parcours } from '@/domain/entities/Parcours';
import type { IEtudiant } from '@/domain/entities/Etudiant';
import type { INote } from '@/domain/entities/Note';
import CustomButton from '@/presentation/components/forms/components/customButton.vue';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';

const router = useRouter();
const route = useRoute();

const currentUe = ref<IUE | null>(null);
const allParcours = ref<Parcours[]>([]);
const selectedParcoursIds = ref<number[]>([]);
const availableParcours = ref<Parcours[]>([]);
const etudiants = ref<IEtudiant[]>([]);
const notes = ref<INote[]>([]);

const isLoading = ref(true);
const isSaving = ref(false);
const showParcoursDropdown = ref(false);
const notification = ref<{ message: string; type: string } | null>(null);

// Charger les données de l'UE
const loadUeData = async () => {
  try {
    isLoading.value = true;
    
    const ueId = parseInt(route.params.id as string);
    
    if (isNaN(ueId)) {
      throw new Error('ID UE invalide');
    }
    
    currentUe.value = await UEDAO.getInstance().get(ueId);
    allParcours.value = await ParcoursDAO.getInstance().list();
    selectedParcoursIds.value = currentUe.value.Parcours?.map(p => p.ID).filter(id => id !== null) as number[] || [];
    
    updateAvailableParcours();
    await loadEtudiants();
    await loadNotes();
    
  } catch (error: any) {
    console.error('Erreur chargement UE:', error);
    alert('Erreur: ' + error.message);
    router.push('/ue');
  } finally {
    isLoading.value = false;
  }
};

const updateAvailableParcours = () => {
  availableParcours.value = allParcours.value.filter(p => 
    p.ID && !selectedParcoursIds.value.includes(p.ID)
  );
};

const loadEtudiants = async () => {
  try {
    const allEtudiants = await EtudiantDAO.getInstance().list();
    
    etudiants.value = allEtudiants.filter(etudiant => 
      etudiant.Parcours && 
      etudiant.Parcours.ID && 
      selectedParcoursIds.value.includes(etudiant.Parcours.ID)
    );
    
  } catch (error) {
    console.error('Erreur chargement étudiants:', error);
  }
};

// Charger les notes pour cette UE
const loadNotes = async () => {
  if (!currentUe.value?.ID) return;
  
  try {
    notes.value = await NoteDAO.getInstance().findByUE(currentUe.value.ID);
    console.log('UE ID:', currentUe.value.ID);
    console.log('Notes chargées:', notes.value);
  } catch (error) {
    console.error('Erreur chargement notes:', error);
  }
};

const addParcours = (parcours: Parcours) => {
  if (parcours.ID && !selectedParcoursIds.value.includes(parcours.ID)) {
    selectedParcoursIds.value.push(parcours.ID);
    updateAvailableParcours();
    loadEtudiants();
    showNotification('Parcours ajouté avec succès', 'success');
    showParcoursDropdown.value = false;
  }
};

const removeParcours = (parcoursId: number) => {
  selectedParcoursIds.value = selectedParcoursIds.value.filter(id => id !== parcoursId);
  updateAvailableParcours();
  loadEtudiants();
};

const getParcoursById = (id: number) => {
  return allParcours.value.find(p => p.ID === id);
};

// Obtenir la note d'un étudiant
const getNote = (etudiantId: number | null): string => {
  if (etudiantId === null) return '';
  
  const note = notes.value.find(n => n.Etudiant.ID === etudiantId);
  return note?.Valeur !== null && note?.Valeur !== undefined ? note.Valeur.toString() : '';
};

// Modifier une note
const updateNote = async (etudiant: IEtudiant, noteValue: string) => {
  console.log('=== updateNote appelé ===');
  console.log('Étudiant:', etudiant.Nom, etudiant.ID);
  console.log('Note value:', noteValue);
  console.log('UE ID:', currentUe.value?.ID);
  
  if (!etudiant.ID || !currentUe.value?.ID) {
    console.log('STOP: ID manquant');
    return;
  }
  
  const valeur = noteValue.trim() === '' ? null : parseFloat(noteValue);
  console.log('Valeur parsée:', valeur);
  
  if (valeur !== null && (valeur < 0 || valeur > 20)) {
    alert('La note doit être entre 0 et 20');
    return;
  }
  
  try {
    const existingNote = await NoteDAO.getInstance().findByEtudiantUE(etudiant.ID, currentUe.value.ID);
    console.log('Note existante:', existingNote);
    
    if (existingNote) {
      console.log('Mise à jour de la note...');
      await NoteDAO.getInstance().update(existingNote.ID!, {
        ...existingNote,
        Valeur: valeur
      });
      console.log('Note mise à jour !');
    } else if (valeur !== null) {
      console.log('Création de la note...');
      await NoteDAO.getInstance().create({
        ID: null,
        Valeur: valeur,
        Etudiant: etudiant,
        UE: currentUe.value
      });
      console.log('Note créée !');
    }
    
    await loadNotes();
    console.log('Notes rechargées');
    showNotification('Note enregistrée', 'success');
    
  } catch (error: any) {
    console.error('Erreur sauvegarde note:', error);
    alert('Erreur: ' + error.message);
  }
};

const saveUe = async () => {
  if (!currentUe.value || !currentUe.value.ID) return;
  
  try {
    isSaving.value = true;
    
    const parcoursObjects = selectedParcoursIds.value
      .map(id => allParcours.value.find(p => p.ID === id))
      .filter(p => p !== undefined) as Parcours[];
    
    const updatedUe: IUE = {
      ...currentUe.value,
      Parcours: parcoursObjects
    };
    
    await UEDAO.getInstance().update(currentUe.value.ID as number, updatedUe);
    
    showNotification('UE enregistrée avec succès', 'success');
    
  } catch (error: any) {
    console.error('Erreur sauvegarde:', error);
    alert('Erreur: ' + error.message);
  } finally {
    isSaving.value = false;
  }
};

const goBack = () => {
  router.push('/ue');
};

const showNotification = (message: string, type: string) => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};

watch(() => route.params.id, () => {
  loadUeData();
});

onMounted(() => {
  loadUeData();
});
</script>

<template>
  <div class="container-fluid p-3">
    <!-- Notification -->
    <div v-if="notification" class="notification" :class="notification.type">
      {{ notification.message }}
      <button class="close-btn" @click="notification = null">×</button>
    </div>

    <div v-if="isLoading" class="text-center p-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="currentUe" class="row g-3">
      <!-- Colonne gauche : UE + Notes -->
      <div class="col-md-8">
        <!-- Card UE -->
        <div class="card mb-3">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6">
                <CustomInput
                  v-model="currentUe.NumeroUe"
                  id="numero"
                  libelle="Numéro"
                  type="text"
                  placeholder="Numéro"
                />
              </div>
              <div class="col-6">
                <CustomInput
                  v-model="currentUe.Intitule"
                  id="intitule"
                  libelle="Intitulé"
                  type="text"
                  placeholder="Intitulé"
                />
              </div>
            </div>
            <div class="text-end mt-3">
              <CustomButton 
                :color="BootstrapButtonEnum.primary"
                @click="saveUe"
                :disabled="isSaving"
              >
                {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
              </CustomButton>
            </div>
          </div>
        </div>

        <!-- Card Notes -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Notes</h5>
          </div>
          <div class="card-body p-0">
            <table class="table table-striped mb-0">
              <tbody>
                <tr v-if="etudiants.length === 0">
                  <td class="text-muted text-center py-3">Aucun étudiant</td>
                </tr>
                <tr v-for="etudiant in etudiants" :key="etudiant.ID ?? 0">
                  <td>{{ etudiant.Nom }} {{ etudiant.Prenom }}</td>
                  <td class="text-end" style="width: 100px;">
                    <div class="d-flex align-items-center justify-content-end">
                      <input
                        type="number"
                        class="form-control form-control-sm text-center"
                        style="width: 50px;"
                        :value="getNote(etudiant.ID)"
                        @change="updateNote(etudiant, ($event.target as HTMLInputElement).value)"
                        placeholder="__"
                        min="0"
                        max="20"
                      />
                      <span class="ms-1">/ 20</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Colonne droite : Parcours -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Parcours</h5>
            <button 
              v-if="availableParcours.length > 0"
              class="btn btn-sm btn-success"
              @click="showParcoursDropdown = !showParcoursDropdown"
            >
              +
            </button>
          </div>
          
          <!-- Dropdown pour ajouter -->
          <div v-if="showParcoursDropdown && availableParcours.length > 0" class="dropdown-menu show p-2" style="position: relative; width: 100%;">
            <button
              v-for="parcours in availableParcours"
              :key="parcours.ID ?? 0"
              class="dropdown-item"
              @click="addParcours(parcours)"
            >
              {{ parcours.NomParcours }}
            </button>
          </div>

          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li v-if="selectedParcoursIds.length === 0" class="list-group-item text-muted">
                Aucun parcours
              </li>
              <li 
                v-for="parcoursId in selectedParcoursIds" 
                :key="parcoursId"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{{ getParcoursById(parcoursId)?.NomParcours }}</span>
                <button 
                  class="btn btn-sm text-danger p-0"
                  @click="removeParcours(parcoursId)"
                >
                  −
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #dee2e6;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification.success {
  background-color: #28a745;
  color: white;
}

.notification.error {
  background-color: #dc3545;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
}

.list-group-item {
  padding: 0.5rem 1rem;
}

.table td {
  vertical-align: middle;
  padding: 0.5rem 1rem;
}
</style>