<template>
    <v-form v-model="valid" ref="form" style="max-width: 800px">
        <v-alert v-if="readonly" color="primary" outlined text>
            This project is defined through the config and cannot be modified via the UI.
        </v-alert>
        <div class="caption">
            Project is a separate infrastructure or environment, e.g. <var>production</var>, <var>staging</var> or
            <var>prod-us-west</var>.
        </div>
        <v-form v-model="valid" :disabled="readonly" @submit.prevent="save">
            <v-text-field v-model="name" :rules="[validators.isSlug]" outlined dense required />

            <v-alert v-if="error" color="red" icon="mdi-alert-octagon-outline" outlined text>
                {{ error }}
            </v-alert>
            <v-alert v-if="message" color="green" outlined text>
                {{ message }}
            </v-alert>
            <v-btn block color="primary" @click="save" :disabled="readonly || !valid" :loading="loading">Save</v-btn>
        </v-form>
    </v-form>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router'
import type Api from '@/api'

const props = defineProps({
    projectId: String,
})
const api = inject<Api>("$api")
const validators = inject<any>("$validators")
// const events = inject<any>("$events")
const router = useRouter()

onMounted(() => {
    fetchData()
})

watch(() => props.projectId, () => fetchData())

const form = ref()
const name = ref('')
const readonly = ref(false)
const valid = ref(false)
const loading = ref(false)
const error = ref('')
const message = ref('')

const fetchData = () => {
    loading.value = true;
    error.value = '';
    api?.getProject(props.projectId, (data: any, err: string) => {
        loading.value = false;
        if (err) {
            error.value = err;
            return;
        }
        readonly.value = data.readonly;
        name.value = data.name;
        // if (!props.projectId && this.$refs.form) {
        //     this.$refs.form.resetValidation();
        // }
    });
};

const save = () => {
    if (!valid.value) {
        return;
    }
    loading.value = true;
    error.value = '';
    message.value = '';
    api?.saveProject(props.projectId, { name: name.value }, (data: any, err: string) => {
        loading.value = false;
        if (err) {
            error.value = err;
            return;
        }
        // console.log('events', events)
        // events.emit('projects');
        message.value = 'Settings were successfully updated.';
        if (!props.projectId) {
            const projectId = data.trim();
            router.replace({ name: 'project_settings', params: { projectId, tab: 'prometheus' } }).catch((err) => err);
        }
    });
};
</script>

<style scoped></style>
