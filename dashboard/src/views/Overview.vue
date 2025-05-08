<script setup lang="ts">
import type Utils from '@/utils/utils';
import Applications from '@/views/Applications.vue';
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    view: String,
    id: String,
    report: String,
})

const route = useRoute()
const utils = inject<Utils>("$utils")

const views = computed(() => {
    return {
        '': route.query, // a bit of a hack to enable reactivity for tabs
        applications: 'Applications',
        incidents: 'Incidents',
        map: 'Service Map',
        traces: 'Traces',
        nodes: 'Nodes',
        deployments: 'Deployments',
        costs: 'Costs',
        anomalies: '',
        risks: 'Risks',
    };
})
</script>


<template>
    <div>
        <div class="my-4">
            <v-tabs :value="props.view" height="40" show-arrows slider-size="2">
                <template v-for="(name, view) in views">
                    <v-tab v-if="name && view" :to="{
                        params: { view, id: undefined, report: undefined },
                        query: view === 'incidents' ? { ...utils?.contextQuery(), incident: undefined } : utils?.contextQuery(),
                    }" :tab-value="view">
                        {{ name }}
                    </v-tab>
                </template>
            </v-tabs>
        </div>

        <template v-if="props.view === 'applications'">
            <!-- <Application v-if="props.id" :id="id" :report="props.report" /> -->
            <!-- <Applications v-else /> -->
            <Applications />
        </template>

        <!-- <template v-if="view === 'incidents'">
            <Incident v-if="route.query.incident" />
            <Incidents v-else />
        </template>

        <template v-if="view === 'map'">
            <ServiceMap />
        </template>

        <template v-if="view === 'nodes'">
            <Node v-if="id" :name="id" />
            <Nodes v-else />
        </template>

        <template v-if="view === 'deployments'">
            <Deployments />
        </template>

        <template v-if="view === 'traces'">
            <Traces />
        </template>

        <template v-if="view === 'costs'">
            <Costs />
        </template>

        <template v-if="view === 'anomalies'">
            <RCA v-if="id" :appId="id" />
            <Anomalies v-else />
        </template>

        <template v-if="view === 'risks'">
            <Risks />
        </template> -->
    </div>
</template>
