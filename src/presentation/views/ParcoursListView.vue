<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/customButton.vue';
import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';
import { ParcoursDAO } from '@/domain/does/ParcoursDAO';
import type { Parcours } from '@/domain/entities/Parcours';
import CustomTable from '@/presentation/components/table/customTable.vue';

const parcoursForm = ref<typeof ParcoursForm | null>(null);
const parcours = ref<Parcours[]>([]);

const formatterEdition = (parcours: Parcours) => { 
  return '<i class="bi bi-pen-fill text-primary"></i>'; 
}; 

const formatterSuppression = (parcours: Parcours) => { 
  return '<i class="bi bi-trash-fill text-danger"></i>'; 
};

const columns = [ 
  { field: 'EditionParcours', label: 'Edition', formatter: formatterEdition, onClick: () => { } }, 
  { field: 'ID', label: 'ID', formatter: null, onClick: null }, 
  { field: 'NomParcours', label: 'Intitulé', formatter: null, onClick: null }, 
  { field: 'AnneeFormation', label: 'Année', formatter: null, onClick: null }, 
  { field: 'DeleteParcours', label: 'Suppression', formatter: formatterSuppression, onClick: () => { } }, 
];

const loadParcours = async () => {
    parcours.value = await ParcoursDAO.getInstance().list();
};

onMounted(() => {
    loadParcours();
});
</script>
<template> 
    <div class="container-fluid"> 
      <div class="card mt-5"> 
        <div class="card-header d-flex justify-content-between align-items-center"> 
          <div class="card-title"> 
            <h4 class="mb-0">Liste des parcours</h4> 
          </div> 
          <CustomButton :color="BootstrapButtonEnum.info" @click="() => parcoursForm?.openForm()"> 
            Ajouter un parcours 
          </CustomButton> 
        </div> 
        <div class="card-body"> 
          <CustomTable idAttribute="ID" :columns="columns" :data="parcours" /> 
        </div> 
      </div> 
    </div> 
    <ParcoursForm ref="parcoursForm" :parcours="null" @saved="loadParcours" /> 
</template>