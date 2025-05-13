<script setup lang="ts">
import Widget from './Widget.vue';

defineProps({
    name: String,
    widgets: Array<any>,
});
</script>

<template>
    <div class="d-flex flex-wrap">
        <Widget
            v-for="(w, i) in widgets"
            :key="name + ':' + i"
            :w="w"
            class="my-5 w-6/12 md:w-full"
        />
    </div>
</template>
