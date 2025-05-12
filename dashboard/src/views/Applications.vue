<script setup lang="ts">
import { type DataTableColumns } from "naive-ui";
import type { RowData } from "naive-ui/es/data-table/src/interface";
import { computed, h, inject, onMounted } from "vue";
import { useRouter } from "vue-router";
// import ApplicationFilter from '../components/ApplicationFilter.vue';

const utils = inject<any>("$utils");
const api = inject<any>("$api");
const router = useRouter()

const statusesEnum: { [key: string]: { name: string; color: string } } = {
  critical: { name: "SLO violation", color: "error" },
  warning: { name: "Warning", color: "warning" },
  info: { name: "Errors in logs", color: "info" },
  unknown: { name: "Integration required", color: "" },
  ok: { name: "OK", color: "success" },
};

let applications: any[] = [];
const filter = new Set();
let loading = false;
let error = "";

onMounted(() => {
  console.log("applications mounted");
  get();
  //   events?.watch(this, get, "refresh");
});

const statuses = computed(() => {
  return Object.keys(statusesEnum).map((s: any) => {
    return {
      ...statusesEnum[s],
      count: items.value.filter((i: any) => i.status === s).length,
    };
  });
});
const items = computed(() => {
  if (!applications) {
    return [];
  }

  const apps = applications
    .filter((a) => filter.has(a.id))
    .map((a) => ({ ...a }));
  const names: any = {};
  apps.forEach((a) => {
    const id = utils.appId(a.id);
    a.name = id.name;
    a.ns = id.ns;
    if (names[id.name]) {
      names[id.name]++;
    } else {
      names[id.name] = 1;
    }
  });

  return applications.map((a) => {
    return {
      ...a,
      ns: names[a.name] > 1 ? a.ns : "",
      color: statusesEnum[a.status].color,
    };
  });
});

const get = () => {
  loading = true;
  error = "";
  api.getOverview("applications", "", (data: any, error: any) => {
    loading = false;
    if (error) {
      error = error;
      return;
    }
    applications = data.applications;
  });
};
// const setFilter = (filter: string) => {
//     filter = filter;
// };

const rowProps = (row: RowData) => {
  return {
    style: 'cursor: pointer;',
  }
};

const columns: DataTableColumns<any> = [
  {
    title: 'Application',
    key: 'application',
    render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: undefined },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'Type',
    key: 'type'
  },
  {
    title: 'Errors',
    key: 'errors',
    render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'SLO' },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'Latency',
    key: 'latency',
    render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'SLO' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'Upstreams',
    key: 'upstreams',
    render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'SLO' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'Instances',
    key: 'instances',
    render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: undefined },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'Restarts',
    key: 'restarts',
     render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'Instances' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'CPU',
    key: 'cpu',
     render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'CPU' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'Memory',
    key: 'memory',
     render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'Memory' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'I/O load',
    key: 'disk_io_load',
     render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'Storage' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'Disk',
    key: 'disk_usage',
     render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'Storage' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'Net',
    key: 'network',
     render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'Net' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => '' }
      )
    }
  },
  {
    title: 'DNS',
    key: 'dns',
     render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'Instances' },
            query: { ...utils.contextQuery() },
          })
        },
        { default: () => 'DNS' }
      )
    }
  },
  {
    title: 'Logs',
    key: 'logs',
     render(row) {
      return h(
        "div",
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => router.push({
            name: "overview",
            params: { view: "applications", id: row.id, report: 'Instances' },
            query: { ...utils.contextQuery(), query: JSON.stringify({ source: 'agent', view: 'patterns' }) },
          })
        },
        { default: () => '' }
      )
    }
  },
]
</script>

<template>
  <div>
    <n-progress v-if="loading" type="line" :percentage="100" indicator-placement="inside" processing />

    <n-alert v-if="error" title="Something goes wrong!" type="error">
      {{ error }}
    </n-alert>

    <!-- <ApplicationFilter :applications="applications" @filter="setFilter" class="my-4" /> -->

    <div class="flex items-center gap-2 mb-3">
        <n-space :size="24" align="center" item-style="display: flex;">

          <div v-for="s in statuses" class="flex items-center gap-1">
            <n-tag :bordered="false" :type="s.color" class="font-semibold">{{ s.count }}</n-tag>
            <div class="font-semibold">{{ s.name }}</div>
          </div>
        </n-space>
    </div>

    <n-data-table :columns="columns" :data="items" :row-props="rowProps" />
    <!-- <v-data-table
<template #item.type="{ item: { id, type } }">
        <div v-if="type" class="d-flex align-center">

          <router-link
            v-if="type.report"
            :to="link(id, type.report)"
            class="type"
            :class="type.status"
          >
            {{ type.name }}
          </router-link>
          <div v-else class="type">
            {{ type.name }}
          </div>
        </div>
      </template>
</v-data-table> -->
  </div>
</template>