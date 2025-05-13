<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    labels: Object,
})

const keys = computed(() => {
    if (!props.labels) {
        return [];
    }
    const res = Object.keys(props.labels);
    res.sort((a, b) => a.localeCompare(b));
    return res;
})
</script>

<template>
    <span class="labels">
        <span v-for="k in keys" class="label">
            <template v-if="k === 'db'">(mdi-database){{ labels![k] }}</template>
            <template v-else-if="k === 'queue'">(mdi-tray-full){{ labels![k] }}</template>
            <template v-else>{{ k }}:{{ labels![k] }}</template>
        </span>
    </span>
</template>

<style scoped>
.labels {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}
.label {
    font-size: 0.75rem;
    color: #9e9e9e;
}
.label:not(:last-child):after {
    content: ' / ';
}
</style>
