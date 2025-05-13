<script setup lang="ts">
import { inject } from 'vue';
import Led from './Led.vue';

defineProps({
    app: Object
});

const utils = inject < any > ("$utils")
</script>


<template>
    <n-tooltip v-if="app?.indicators" trigger="hover">
        <template #trigger>
            <Led :status="app.status" />
            <span>{{ utils.appId(app.id).name }}</span>
        </template>
        <n-card size="small">
            <div v-for="i in app?.indicators">
                <Led :status="i.status" />
                <span>{{ i.message }}</span>
            </div>
        </n-card>
    </n-tooltip>
    <span v-else>
        <Led :status="app?.status" />
        <span>{{ utils.appId(app?.id).name }}</span>
    </span>
</template>
