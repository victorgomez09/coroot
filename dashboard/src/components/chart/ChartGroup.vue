<script setup lang="ts">
import { computed, ref } from 'vue'
import Chart from './Chart.vue';

const props = defineProps({
    title: String,
    charts: Array,
    selection: Object,
    doc: String,
});

const charts = ref < any > ()
const i = charts.value.findIndex((ch: any) => ch.featured)
const selected = charts.value[i < 0 ? 0 : i].title

const chart = computed(() => {
    let chart = sorted.value.find((ch: any) => ch.title === selected.value);
    if (chart) return chart;
    chart = sorted.value.find((ch: any) => ch.featured);
    if (chart) return chart;
    return sorted.value[0];
});
const sorted = computed(() => {
    return sort();
});
const splitTitle = computed(() => {
    const parts = props.title?.split('<selector>', 2);
    if (parts?.length === 0) {
        return { head: '', tail: '' };
    }
    if (parts?.length === 1) {
        return { head: parts[0], tail: '' };
    }
    
    return { head: parts![0], tail: parts![1] };
});

function sort() {
    const res = Array.from(this.charts);
    res.sort((a: any, b: any) => a.title.localeCompare(b.title));
    return res;
};
function select(s) {
    // $emit('select', s);
};
</script>

<template>
    <Chart :chart="chart" :selection="selection" @select="select">
        <template v-slot:title>
            <span>{{ splitTitle.head }}</span>
            <v-menu offset-y>
                <template #activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" text outlined x-small class="selector">
                        <span style="max-width: 90%; overflow: hidden; text-overflow: ellipsis">{{ selected }}</span>
                        <v-icon small class="ml-1">mdi-menu-down</v-icon>
                    </v-btn>
                </template>
                <v-list dense class="pa-0">
                    <v-list-item-group :value="selected">
                        <v-list-item v-for="ch in sorted" :key="ch.title" @click="selected = ch.title" class="py-1 px-2"
                            style="min-height: 0">
                            <v-list-item-title class="item">{{ ch.title }}</v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>
            <span>{{ splitTitle.tail }}</span>
            <a v-if="doc" :href="doc" target="_blank" class="ml-1"><v-icon small>mdi-information-outline</v-icon></a>
        </template>
    </Chart>
</template>

<style scoped>
.selector {
    font-size: 14px;
    display: inline;
    max-width: 30%;
    padding: 0 4px !important;
    border-color: var(--border-color) !important;
}

.item {
    font-size: 14px !important;
}
</style>
