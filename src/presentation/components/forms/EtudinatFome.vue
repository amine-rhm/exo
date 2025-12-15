<script setup lang="ts"> 
import { ref, onBeforeMount, watch } from 'vue'; 
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum'; 
import { Etudiant } from '@/domain/entities/Etudiant'; 
import CustomButton from '@/presentation/components/forms/components/customButton.vue'; 
import CustomModal from '@/presentation/components/modals/CustomModal.vue'; 
import { EtudiantDAO } from '@/domain/does/Etudiant'; 
import { ParcoursDAO } from '@/domain/does/ParcoursDAO'; 
import type { IParcours } from '@/domain/entities/Parcours'; 

const currentEtudiant = ref<any>(new Etudiant(0, '', '', '', null)); 
const isOpen = ref(false); 
const parcoursOptions = ref<IParcours[]>([]); 

const openForm = (etudiant: Etudiant | null = null) => { 
    if (etudiant) { 
        currentEtudiant.value = new Etudiant(
            etudiant.ID,
            etudiant.Nom,
            etudiant.Prenom,
            etudiant.Email,
            etudiant.Parcours
        );
    } else {
        currentEtudiant.value = new Etudiant(0, '', '', '', null);
    }
    isOpen.value = true; 
}; 

const closeForm = () => { 
    isOpen.value = false; 
    currentEtudiant.value = new Etudiant(0, '', '', '', null); 
}; 

const saveEtudiant = async () => { 
    if (!currentEtudiant.value.Nom || !currentEtudiant.value.Prenom || !currentEtudiant.value.Email) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        if (currentEtudiant.value.ID && currentEtudiant.value.ID > 0) { 
            await EtudiantDAO.getInstance().update(currentEtudiant.value.ID as number, currentEtudiant.value);
            alert('Étudiant mis à jour avec succès'); 
            emit('update:etudiant', currentEtudiant.value); 
        } else { 
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

const emit = defineEmits<{
    'create:etudiant': [etudiant: any];
    'update:etudiant': [etudiant: any];
}>(); 

onBeforeMount(async () => { 
    try {
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
        currentEtudiant.value = newEtudiant as any;
        openForm(); 
    } 
}); 
</script> 

<template> 
    <CustomModal :isOpen="isOpen"> 
        <template v-slot:title> 
            <template v-if="currentEtudiant && currentEtudiant.ID && currentEtudiant.ID > 0">Modification de l'étudiant</template> 
            <template v-else>Nouvel étudiant</template> 
        </template> 
        <template v-slot:body> 
            <form class="text-start">
                <div class="mb-3">
                    <label for="nom" class="form-label">Nom</label>
                    <input 
                        id="nom"
                        v-model="currentEtudiant.Nom" 
                        type="text" 
                        class="form-control"
                        placeholder="Nom de l'étudiant" 
                    />
                </div>

                <div class="mb-3">
                    <label for="prenom" class="form-label">Prénom</label>
                    <input 
                        id="prenom"
                        v-model="currentEtudiant.Prenom" 
                        type="text" 
                        class="form-control"
                        placeholder="Prénom de l'étudiant" 
                    />
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input 
                        id="email"
                        v-model="currentEtudiant.Email" 
                        type="email" 
                        class="form-control"
                        placeholder="email@exemple.fr" 
                    />
                </div>

                <div class="mb-3">
                    <label for="parcours" class="form-label">Parcours</label>
                    <select 
                        id="parcours"
                        :value="currentEtudiant.Parcours?.ID ?? ''"
                        @change="(e: Event) => {
                            const target = e.target as HTMLSelectElement;
                            if (!target.value) {
                                currentEtudiant.Parcours = null;
                                return;
                            }
                            const id = parseInt(target.value);
                            const parcours = parcoursOptions.find(p => p.ID === id);
                            currentEtudiant.Parcours = parcours ? parcours : null;
                        }"
                        class="form-select"
                    >
                        <option value="">Sélectionner un parcours...</option>
                        <option 
                            v-for="parcours in parcoursOptions" 
                            :key="parcours.ID ?? 0"
                            :value="parcours.ID"
                        >
                            {{ parcours.NomParcours }}
                        </option>
                    </select>
                </div>
            </form>
        </template>
        <template v-slot:footer>
            <CustomButton 
                :color="BootstrapButtonEnum.danger" 
                @click="closeForm"
            > 
                Annuler 
            </CustomButton> 
            <CustomButton 
                :color="BootstrapButtonEnum.primary" 
                @click="saveEtudiant"
            > 
                Enregistrer 
            </CustomButton> 
        </template>
    </CustomModal> 
</template>