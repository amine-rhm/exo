<script setup lang="ts"> 

const props = defineProps<{ 
    idAttribute: string, 
    columns: { field: string, label: string, formatter: Function | null, onClick: Function | null }[], 
    data: any[] 
}>(); 

</script> 

<template> 
    <table class="table table-striped"> 
        <thead> 
            <tr> 
                <th v-for="column in props.columns" :key="column.field">{{ column.label }}</th> 
            </tr> 
        </thead> 
        <tbody> 
            <tr v-for="item in props.data" :key="item[props.idAttribute]"> 
                <td v-for="column in props.columns" :key="column.field" 
                    @click="column.onClick ? column.onClick(item) : () => { }"> 
                    <span :class="{ clickable: column.onClick, 'icon-cell': column.formatter }"> 
                        <template v-if="column.formatter"><span v-html="column.formatter(item)"></span></template> 
                        <template v-else>{{ item[column.field] }}</template> 
                    </span> 
                </td> 
            </tr> 
        </tbody> 
    </table> 
</template> 

<style scoped> 
.clickable { 
    cursor: pointer; 
} 

.icon-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.9rem;
}

td {
    text-align: center;
    vertical-align: middle;
}

th {
    text-align: center;
}
</style>