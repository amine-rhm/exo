<script setup lang="ts">
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { computed} from 'vue';

const props = defineProps<{
    color: BootstrapButtonEnum
}>();

const buttonClasses = computed(() => {

    return {
        'btn': true,
        [props.color]: true
    }
});
</script>

<template>
    <button type="button" :class="buttonClasses">
        <slot />
    </button>
</template>