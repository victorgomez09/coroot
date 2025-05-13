<script setup lang="ts">
import Chart from './Chart.vue';
import ChartGroup from './ChartGroup.vue';
import DependencyMap from './DependencyMap.vue';
// import Table from './Table';
// import Heatmap from './Heatmap';
// import Logs from '../views/Logs';
// import Profiling from '../views/Profiling';
// import Tracing from '../views/Tracing';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    w: Object
})

const route = useRoute();
const router = useRouter();

const heatmapSelection = computed(() => {
    const hm = props.w?.heatmap;
    return hm && hm.drill_down_link ? {} : null;
});
const doc_link = computed(() => {
    const l = props.w?.doc_link;
    if (!l) {
        return null;
    }
    return `https://docs.coroot.com/${l.group}/${l.item}${l.hash ? '#' + l.hash : ''}`;
});

function chartZoom(s: any) {
    const { from, to } = s.selection;
    const query = { ...route.query, from, to };
    router.push({ query }).catch((err) => err);
};
function heatmapDrillDown(s: any) {
    const hm = props.w?.heatmap;
    if (hm && hm.drill_down_link && s.x1) {
        const tsRange = `${s.x1 || ''}-${s.x2 || ''}`;
        const durRange = `${s.y1 || ''}-${s.y2 || ''}`;
        const trace = `::${tsRange}:${durRange}:`;
        const { from, to } = props.w?.heatmap.ctx;
        const query = { ...route.query, from, to, trace };
        router.push({ ...hm.drill_down_link, query }).catch((err) => err);
    }
};
</script>


<template>
    <div>
        <Chart v-if="w?.chart" :chart="w.chart" :selection="{}" @select="chartZoom" :doc="doc_link" />
        <ChartGroup v-if="w?.chart_group" :title="w?.chart_group.title" :charts="w?.chart_group.charts" :selection="{}"
            @select="chartZoom" :doc="doc_link" />
        <DependencyMap v-if="w?.dependency_map" :nodes="w.dependency_map.nodes" :links="w.dependency_map.links" />
        <Table v-if="w?.table" :header="w.table.header" :rows="w.table.rows" />
        <Heatmap v-if="w?.heatmap" :heatmap="w.heatmap" :selection="heatmapSelection" @select="heatmapDrillDown" />
        <Logs v-if="w?.logs" :appId="w.logs.application_id" :check="w.logs.check" />
        <Profiling v-if="w?.profiling" :appId="w.profiling.application_id" />
        <Tracing v-if="w?.tracing" :appId="w.tracing.application_id" />
    </div>
</template>
