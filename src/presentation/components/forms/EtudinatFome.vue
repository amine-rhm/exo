<script setup lang="ts"> 
import { ref, onBeforeMount, watch } from 'vue'; 
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum'; 
import { Etudiant } from '@/domain/entities/Etudiant'; 
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue'; 
import CustomButton from '@/presentation/components/forms/components/customButton.vue'; 
import CustomModal from '@/presentation/components/modals/CustomModal.vue'; 
import { EtudiantDAO } from '@/domain/does/Etudiant'; 
import { ParcoursDAO } from '@/domain/does/ParcoursDAO'; 
import type { Parcours } from '@/domain/entities/Parcours'; 

const currentEtudiant = ref<Etudiant>(new Etudiant(null, null, null, null, null)); 
const isOpen = ref(false); 
const formErrors = ref<{ 
    Nom: string | null; 
    Prenom: string | null; 
    Email: string | null; 
    Parcours: string | null;
}>({ 
    Nom: null, 
    Prenom: null, 
    Email: null,
    Parcours: null,
}); 

const parcoursOptions = ref<Parcours[]>([]); 

const openForm = (etudiant: Etudiant | null = null) => { 
    isOpen.value = true; 
    if (etudiant) { 
        currentEtudiant.value = etudiant; 
    } 
}; 

const closeForm = () => { 
    isOpen.value = false; 
    currentEtudiant.value = new Etudiant(null, null, null, null, null); 
}; 

const saveEtudiant = async () => { 
    // Vérifier les erreurs
    if (formErrors.value.Nom || formErrors.value.Prenom || formErrors.value.Email) { 
        alert('Veuillez corriger les erreurs avant de sauvegarder');
        return; 
    } 

    // Vérifier les champs obligatoires
    if (!currentEtudiant.value.Nom || !currentEtudiant.value.Prenom || !currentEtudiant.value.Email) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        if (currentEtudiant.value.ID) { 
            // MISE À JOUR d'un étudiant existant
            console.log('Mise à jour de l\'étudiant:', currentEtudiant.value.ID);
            const updatedEtudiant = await EtudiantDAO.getInstance().update(
                currentEtudiant.value.ID, 
                currentEtudiant.value
            );
            alert('Étudiant mis à jour avec succès'); 
            emit('update:etudiant', updatedEtudiant); 
        } else { 
            // CRÉATION d'un nouvel étudiant
            console.log('Création d\'un nouvel étudiant'); 
            const newEtudiant = await EtudiantDAO.getInstance().create(currentEtudiant.value);
            alert('Étudiant créé avec succès'); 
            emit('create:etudiant', newEtudiant); 
        }
        closeForm(); 
    } catch (ex: any) { 
        console.error('Erreur lors de la sauvegarde:', ex); 
        alert('Erreur: ' + ex.message); 
    }
};
 
const props = defineProps({ 
    etudiant: { 
        type: Object as () => Etudiant | null, 
        required: false, 
        default: null, 
    }, 
}); 

const emit = defineEmits(['create:etudiant', 'update:etudiant']); 

onBeforeMount(async () => { 
    if (props.etudiant) { 
        currentEtudiant.value = props.etudiant; 
    } 

    try {
        // Chargement de la liste des parcours 
        parcoursOptions.value = await ParcoursDAO.getInstance().list();
    } catch (error) {
        console.error('Erreur chargement parcours:', error);
    }
}); 

defineExpose({ 
    openForm, 
    closeForm, 
}); 

watch(() => props.etudiant, (newEtudiant) => { 
    if (newEtudiant) { 
        currentEtudiant.value = newEtudiant; 
        openForm(); 
    } 
}); 

watch(() => currentEtudiant.value.Nom, () => { 
    if (!currentEtudiant.value.Nom || currentEtudiant.value.Nom.trim() === '' || currentEtudiant.value.Nom.length < 2) { 
        formErrors.value.Nom = 'Le nom doit faire au moins 2 caractères'; 
    } else { 
        formErrors.value.Nom = null; 
    } 
}); 

watch(() => currentEtudiant.value.Prenom, () => { 
    if (!currentEtudiant.value.Prenom || currentEtudiant.value.Prenom.trim() === '' || currentEtudiant.value.Prenom.length < 2) { 
        formErrors.value.Prenom = 'Le prénom doit faire au moins 2 caractères'; 
    } else { 
        formErrors.value.Prenom = null; 
    } 
}); 

watch(() => currentEtudiant.value.Email, () => { 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!currentEtudiant.value.Email || currentEtudiant.value.Email.trim() === '') { 
        formErrors.value.Email = 'L\'email est obligatoire'; 
    } else if (!emailRegex.test(currentEtudiant.value.Email)) {
        formErrors.value.Email = 'L\'email n\'est pas valide';
    } else { 
        formErrors.value.Email = null; 
    } 
}); 
</script> 

<template> 
    <CustomModal :isOpen="isOpen"> 
        <template v-slot:title> 
            <template v-if="etudiant && etudiant.ID">Modification de l'étudiant</template> 
            <template v-else>Nouvel étudiant</template> 
        </template> 
        <template v-slot:body> 
            <div class="text-start mt-1 mb-1"> 
                <form> 
                    <CustomInput 
                        v-model="currentEtudiant.Nom" 
                        class="mt-2" 
                        id="nom" 
                        libelle="Nom" 
                        type="text" 
                        placeholder="Nom de l'étudiant" 
                        :error="formErrors.Nom" 
                    /> 
                    <CustomInput 
                        v-model="currentEtudiant.Prenom" 
                        id="prenom" 
                        libelle="Prénom" 
                        type="text" 
                        placeholder="Prénom de l'étudiant" 
                        :error="formErrors.Prenom" 
                    /> 
                    <CustomInput 
                        v-model="currentEtudiant.Email" 
                        id="email" 
                        libelle="Email" 
                        type="email" 
                        placeholder="email@exemple.fr" 
                        :error="formErrors.Email" 
                    /> 
                    <div class="form-group"> 
                        <label for="parcours">Parcours :</label> 
                        <v-select 
                            label="NomParcours" 
                            v-model="currentEtudiant.Parcours" 
                            :options="parcoursOptions"
                        ></v-select> 
                        <div v-if="formErrors.Parcours" class="invalid-feedback"> 
                            {{ formErrors.Parcours }} 
                        </div> 
                    </div> 
                </form> 
            </div> 
            <CustomButton 
                class="mt-1" 
                style="margin-left: 5px" 
                :color="BootstrapButtonEnum.danger" 
                @click="closeForm"
            > 
                Annuler 
            </CustomButton> 
            <CustomButton 
                class="mt-1" 
                style="margin-left: 5px" 
                :color="BootstrapButtonEnum.primary" 
                @click="saveEtudiant"
            > 
                Enregistrer 
            </CustomButton> 
        </template> 
    </CustomModal> 
</template>