<script setup lang="ts">
import type Utils from "@/utils/utils";
import Applications from "@/views/Applications.vue";
import Application from "@/views/Application.vue";
import { computed, inject, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
  view: String,
  id: String,
  report: String,
});

const route = useRoute();
const router = useRouter();
const utils = inject<Utils>("$utils");

onMounted(() => {
  if (!props.view) {
    router.push({ name: "overview", params: { view: "applications" } });
  }
});

// const views = computed(() => {
//   return {
//     "": route.query, // a bit of a hack to enable reactivity for tabs
//     applications: "Applications",
//     incidents: "Incidents",
//     map: "Service Map",
//     traces: "Traces",
//     nodes: "Nodes",
//     deployments: "Deployments",
//     costs: "Costs",
//     anomalies: "",
//     risks: "Risks",
//   };
// });
</script>

<template>
  <div>
    {{ view }}

    <template v-if="view === 'applications'">
      <Application v-if="props.id" :id="id" :report="props.report" />
      <Applications v-else />
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
