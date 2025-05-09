<template>
    <v-app v-if="!loading">
        <v-app-bar app flat dark class="menu">
            <v-container class="py-0 fill-height flex-nowrap">
                <router-link :to="project ? { name: 'overview', query: utils.contextQuery() } : { name: 'index' }">
                    <!-- <img
                        :src="`${$coroot.base_path}static/logo${$coroot.edition === 'Enterprise' ? '-ee' : ''}.svg`"
                        height="38"
                        class="logo"
                        alt=":~#"
                    /> -->
                    ALVOB
                </router-link>

                <div>
                    <v-menu dark offset-y attach=".v-app-bar">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" plain outlined class="ml-3 px-2" height="40">
                                <v-icon small class="mr-2">mdi-hexagon-multiple</v-icon>
                                <template v-if="smAndUp">
                                    <span class="project-name">
                                        <template v-if="project">{{ project.name }}</template>
                                        <template v-else>choose a project</template>
                                    </span>
                                    <v-icon small class="ml-2">mdi-chevron-up</v-icon>
                                    <!-- <v-icon small class="ml-2"> mdi-chevron-{{ attrs['aria-expanded'] === 'true' ? 'up'
                                        : 'down' }} </v-icon> -->
                                </template>
                            </v-btn>
                        </template>
                        <v-list dense>
                            <v-list-item v-for="p in projects" :key="p.name"
                                :to="{ name: 'overview', params: { projectId: p.id } }">
                                {{ p.name }}
                            </v-list-item>
                            <!-- <v-list-item v-if="!user.readonly" :to="{ name: 'project_new' }" exact>
                                <v-icon small class="mr-1">mdi-plus</v-icon> new project
                            </v-list-item> -->
                            <!-- <v-list-item v-else-if="!projects.length"> no projects available </v-list-item> -->
                            <v-list-item> no projects available </v-list-item>
                        </v-list>
                    </v-menu>
                </div>

                <!--<div v-if="mdAndUp && project && route.name !== 'project_settings'" class="ml-3 flex-grow-1">
                    <Search />
                </div>

                <v-spacer />-->

                <div v-if="smAndUp" class="ml-3">
                    <v-menu dark offset-y tile attach=".v-app-bar">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" plain outlined height="40" class="px-2">
                                <v-icon>mdi-help-circle-outline</v-icon>
                            </v-btn>
                        </template>
                    </v-menu>
                </div>
                <!-- <div v-if="project && route.name !== 'project_settings'" class="ml-3">
                    <TimePicker :small="smAndDown" />
                </div> -->

                <v-btn :to="{ name: project ? 'project_settings' : 'project_new' }" plain outlined
                    height="40" class="ml-3 px-2">
                    <v-icon>mdi-cog</v-icon>
                    <!-- <Led v-if="status" :status="status.status !== 'ok' ? 'warning' : 'ok'" absolute /> -->
                </v-btn>

                <v-menu dark offset-y left tile eager attach=".v-app-bar">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" plain outlined height="40" class="px-2 ml-1">
                            <v-icon>mdi-account</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense>
                        <v-list-item>
                            <div>
                                <div>{{ user.name }}</div>
                                <div class="caption grey--text">login: {{ user.email }}</div>
                                <div class="caption grey--text">role: {{ user.role }}</div>
                            </div>
                        </v-list-item>
                        <v-divider class="my-2" />
                        <v-subheader class="px-4">Theme</v-subheader>
                        <!-- <ThemeSelector /> -->
                        <template v-if="user && !user.anonymous">
                            <v-divider class="my-2" />
                            <v-list-item @click="changePassword = true">Change password</v-list-item>
                            <v-list-item :to="{ name: 'logout' }">Sign out</v-list-item>
                        </template>
                    </v-list>
                </v-menu>
            </v-container>
        </v-app-bar>
        <v-main>
            <v-container style="padding-bottom: 128px">
                <v-alert v-if="status && status.status === 'warning' && route.name !== 'project_settings'" color="red"
                    elevation="2" border="start" class="mt-4" colored-border>
                    <div class="d-sm-flex align-center" style="gap: 8px">
                        <template v-if="status.error">
                            {{ status.error }}
                        </template>
                        <template v-else-if="status.prometheus.status !== 'ok'">
                            <div class="flex-grow-1 mb-3 mb-sm-0">
                                {{ status.prometheus.message }}
                                <div v-if="status.prometheus.error" class="mt-1" style="font-size: 14px">
                                    {{ status.prometheus.error }}
                                </div>
                            </div>
                            <v-btn v-if="status.prometheus.action === 'configure'" outlined
                                :to="{ name: 'project_settings', params: { tab: 'prometheus' } }">
                                <template v-if="status.prometheus.error"> Review the configuration </template>
                                <template v-else> Configure </template>
                            </v-btn>
                            <v-btn v-if="status.prometheus.action === 'wait'" outlined @click="refresh">refresh</v-btn>
                        </template>
                        <template v-else-if="status.node_agent.status !== 'ok'">
                            <div class="flex-grow-1 mb-3 mb-sm-0">
                                No metrics found. If you just installed Coroot and node-agent, please wait a couple
                                minutes for it to collect data.
                                <br />
                                If you haven't installed node-agent, please do so now.
                            </div>
                            <AgentInstallation outlined>Install node-agent</AgentInstallation>
                        </template>
                        <template v-else-if="status.kube_state_metrics && status.kube_state_metrics.status !== 'ok'">
                            <div class="flex-grow-1 mb-3 mb-sm-0">
                                It looks like you use Kubernetes, so Coroot requires <b>kube-state-metrics</b>
                                to combine individual containers into applications.
                            </div>
                            <v-btn outlined :to="{ name: 'project_settings' }">Install kube-state-metrics</v-btn>
                        </template>
                    </div>
                </v-alert>

                <Welcome v-if="route.name === 'index' && user && !projects.length" :user="user" />

                <router-view v-else />

                <ChangePassword v-if="user" v-model="changePassword" />
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts" setup>
import { computed, inject, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type Api from '@/api';
import Welcome from '@/views/Welcome.vue'
import { useDisplay } from 'vuetify';

const events = inject<any>("$events")
const storage = inject<any>("$storage")
const utils = inject<any>("$utils")
const api = inject<Api>("$api")
const route = useRoute()
const router = useRouter()
const { smAndUp, smAndDown } = useDisplay()

const location = ref("Choose a project")
const loading: Ref<boolean> = ref<boolean>(true);
const user: Ref<any> = ref({})
const changePassword: Ref<boolean> = ref(false)

const getUser = () => {
    if (route.meta.anonymous) {
        return;
    }
    api?.user(null, (data: any, error: string) => {
        if (error) {
            user.value = null;
            return;
        }

        user.value = data;

        if (route.name === 'index' && projects.value.length) {
            let id = projects.value[0].id;
            const lastId = lastProject(id);
            if (lastId && projects.value.find((p: any) => p.id === lastId)) {
                id = lastId;
            }
            router.replace({ name: 'overview', params: { projectId: id } });
        }
    });
};
const refresh = () => {
    events.emit('refresh');
};
const lastProject = (id: string) => {
    return storage.local('last-project', id);
};

const projects = computed(() => {
    if (!user.value) {
        return [];
    }

    return user.value.projects || [];
});
const project = computed(() => {
    const id = route.params.projectId;
    if (!id) {
        return null;
    }
    const project = projects.value.find((p: any) => p.id === id);
    location.value = project?.name

    return project
});
const status = computed(() => {
    console.log('api?.context', api?.context)
    return project.value ? api?.context.status as any : null;
});

watch(route, (prev) => {
    // getUser();
    if (route.query.from !== prev.query.from || route.query.to !== prev.query.to || route.query.incident !== prev.query.incident) {
        events.emit('refresh');
    }
    if (route.params.projectId !== prev.params.projectId) {
        events.emit('refresh');
        lastProject(Array.isArray(route.params.projectId) ? route.params.projectId[0] : route.params.projectId);
    }
});

onMounted(() => {
    getUser();
    loading.value = false;
})
</script>

<style scoped>
.menu .logo {
    vertical-align: middle;
}

.menu>>>.v-btn {
    min-width: unset !important;
    border-color: rgba(255, 255, 255, 0.2);
}

.menu>>>.v-btn:hover {
    border-color: rgba(255, 255, 255, 1);
}

.project-name {
    max-width: 15ch;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
