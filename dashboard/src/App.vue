<template>
  <v-app>
    <Welcome v-if="route.name === 'index' && user && !projects.length" :user="user" />

    <router-view v-else />
  </v-app>
</template>

<script lang="ts" setup>
import { computed, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type Api from '@/api';
import Welcome from '@/views/Welcome.vue'

const events = inject<any>("$events")
const storage = inject<any>("$storage")
const api = inject<Api>("$api")
const route = useRoute()
const router = useRouter()

let user: any = null

const getUser = () => {
  if (route.meta.anonymous) {
    return;
  }
  api?.user(null, (data: any, error: string) => {
    if (error) {
      user = null;
      return;
    }

    user = data;

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

const lastProject = (id: string) => {
  return storage.local('last-project', id);
};

// refresh() {
//     this.$events.emit('refresh');
// };

const projects = computed(() => {
  if (!user) {
    return [];
  }

  return user.projects || [];
})

watch(route, (prev) => {
  getUser();
  if (route.query.from !== prev.query.from || route.query.to !== prev.query.to || route.query.incident !== prev.query.incident) {
    events.emit('refresh');
  }
  if (route.params.projectId !== prev.params.projectId) {
    events.emit('refresh');
    lastProject(Array.isArray(route.params.projectId) ? route.params.projectId[0] : route.params.projectId);
  }
})
</script>
