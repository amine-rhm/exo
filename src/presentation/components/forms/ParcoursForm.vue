<script setup lang="ts">
import { ref, onBeforeMount, toRaw,watch } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Parcours } from '@/domain/entities/Parcours';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/customButton.vue';
import { ParcoursDAO } from '@/domain/does/ParcoursDAO'; 
const emit = defineEmits(['saved']);

const currentParcours = ref<Parcours>(new Parcours(null, null, null));
const isOpen = ref(false);

const formErrors = ref<{ 
  NomParcours: string | null; 
  AnneeFormation: string | null; 
}>({ 
  NomParcours: null, 
  AnneeFormation: null, 
});

watch(() => currentParcours.value.NomParcours, () => { 
  if (currentParcours.value.NomParcours && currentParcours.value.NomParcours.length > 0 && currentParcours.value.NomParcours.length < 3) { 
    formErrors.value.NomParcours = 'Le nom du parcours doit faire au moins 3 caractères'; 
  } else { 
    formErrors.value.NomParcours = null; 
  } 
});


watch(() => currentParcours.value.AnneeFormation, () => { 
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 20;
  const maxYear = currentYear + 20;
  
  if (!currentParcours.value.AnneeFormation || currentParcours.value.AnneeFormation < minYear || currentParcours.value.AnneeFormation > maxYear) { 
    formErrors.value.AnneeFormation = `L'année doit être entre ${minYear} et ${maxYear}`; 
  } else { 
    formErrors.value.AnneeFormation = null; 
  } 
});




const openForm = (parcours: Parcours | null = null) => {
    isOpen.value = true;

    if (parcours) {
        currentParcours.value = structuredClone(toRaw(parcours));
    }
};

const saveParcours = () => { 
  // Vérifier s'il y a des erreurs
  if (formErrors.value.NomParcours || formErrors.value.AnneeFormation) {
    alert('Veuillez corriger les erreurs avant de sauvegarder');
    return;
  }

  // Vérifier si les champs sont remplis
  if (!currentParcours.value.NomParcours || !currentParcours.value.AnneeFormation) {
    alert('Veuillez remplir tous les champs');
    return;
  }

  if (currentParcours.value.ID) { 
    // Mise à jour d'un parcours 
  } else { 
    ParcoursDAO.getInstance().create(currentParcours.value).then(() => { 
      emit('saved');
      closeForm(); 
    }).catch((ex) => { 
      alert(ex.message); 
    }); 
  } 
};

const closeForm = () => {
    isOpen.value = false;
    currentParcours.value = new Parcours(null, null, null);
    formErrors.value = { NomParcours: null, AnneeFormation: null };
};

const props = defineProps({
    parcours: {
        type: Object as () => Parcours | null,
        required: false,
        default: null,
    },
});

onBeforeMount(() => {
    if (props.parcours) {
        currentParcours.value = props.parcours;
    }
});

defineExpose({
    openForm,
    closeForm,
});
</script>

<template>
    <div v-if="isOpen" class="custom-modal">
        <div class="card new-parcours">
            <div class="card-header" style="background: #273656">
                <template v-if="parcours && parcours.ID"> Modification du parcours </template>
                <template v-else> Nouveau parcours </template>
            </div>
            <div class="card-body">
                <div class="card-text mt-1 mb-1">
                    <form>
                        <CustomInput 
                            id="intitule" 
                            libelle="Intitulé" 
                            type="text" 
                            placeholder="Intitulé du parcours" 
                            v-model="currentParcours.NomParcours"
                            :error="formErrors.NomParcours" 
                        />
                        <CustomInput 
                            class="mt-2" 
                            id="annee" 
                            libelle="Année" 
                            type="number"
                            placeholder="Année de formation" 
                            v-model="currentParcours.AnneeFormation"
                            :error="formErrors.AnneeFormation" 
                        />
                    </form>
                </div>
                <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger"
                    @click="closeForm">
                    Annuler
                </CustomButton>
                <CustomButton @click="saveParcours" class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary">
                    Enregistrer
                </CustomButton>
            </div>
        </div>
    </div>
</template>

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