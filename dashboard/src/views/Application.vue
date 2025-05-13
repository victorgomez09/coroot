<script setup lang="ts">
import AppMap from '@/components/AppMap.vue';
// import Dashboard from '../components/Dashboard';
// import NoData from '../components/NoData';
// import Check from '../components/Check';
// import Led from '../components/Led';
// import ApplicationInstrumentation from '../components/ApplicationInstrumentation.vue';

import { inject, onMounted, ref, watch } from 'vue';
import type Api from '../api'
import { useRouter } from 'vue-router'

const props = defineProps({
    id: String,
    report: String
})

const router = useRouter()
const api = inject<Api>("$api")
const utils = inject<any>("$utils")
const app = ref<any>(null)
const loading = ref<boolean>(false)
const error = ref<string>('')
const r = ref<any>(null)

onMounted(() => {
    getData()
})

function getData() {
    loading.value = true;
    error.value = '';
    api?.getApplication(props.id, (data: any, err: string) => {
        loading.value = false;
        if (err) {
            error.value = err;
            return;
        }

        app.value = data;
        showReport();
    });
};

function showReport() {
    if (!app.value || !app.value.reports || !app.value.reports.length) {
        r.value = null;
        return;
    }
    if (!props.report) {
        if (app.value.reports.length > 1 && app.value.reports[0].name === 'SLO' && app.value.reports[0].status === 'unknown') {
            r.value = app.value.reports[1];
        } else {
            r.value = app.value.reports[0];
        }
        router.replace({ params: { report: r.value.name }, query: utils.contextQuery() }).catch((err) => err);
        return;
    }
    const rr = app.value.reports.find((r: any) => r.name === props.report);
    if (!rr) {
        router.replace({ params: { report: null }, query: utils.contextQuery() }).catch((err) => err);
        return;
    }
    r.value = rr;
};
</script>


<template>
    <div>
        <div v-if="error" role="alert" class="alert alert-error alert-soft">
            <span>{{ error }}</span>
        </div>

        <h1 v-else class="text-h5">
            {{ utils.appId(id).name }}
            <progress v-if="loading" class="progress w-56"></progress>
        </h1>

        <div v-if="app">
            <AppMap v-if="app.app_map" :map="app.app_map" class="my-5" />

            <div role="tablist" class="tabs tabs-border" v-if="app.reports && app.reports.length">
                <RouterLink role="tab" class="tab" v-for="r in app.reports" :key="r.name"
                    :to="{ params: { report: r.name }, query: utils.contextQuery() }">
                    <Led v-if="r && (r.checks || r.instrumentation)" :status="r.status" />
                    {{ r.name }}
                </RouterLink>


            </div>
            <div class="card w-96 bg-base-100 card-lg shadow-sm"
                v-if="r && !r.custom && (r.checks || r.instrumentation)">
                <div class="card-body">
                    <div>
                        <ApplicationInstrumentation v-if="r.instrumentation" :appId="id" :type="r.instrumentation"
                            :active="r.status !== 'unknown'" />
                        <Check v-for="check in r.checks" :key="check.id" :appId="id" :check="check" class="mb-2" />
                    </div>
                </div>
                <Dashboard v-if="r" :name="r.name" :widgets="r.widgets" />
                <NoData v-else-if="!loading && !error" />
            </div>
        </div>
    </div>
</template>
