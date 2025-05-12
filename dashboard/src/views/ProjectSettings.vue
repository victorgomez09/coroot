<script setup lang="ts">
import type Api from '@/api';
import type { FormInst } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { inject, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    projectId: String,
})
const api = inject<Api>("$api")
const router = useRouter()
const formRef = ref<FormInst | null>(null)
const message = useMessage()

onMounted(() => {
    fetchData()
})

watch(() => props.projectId, () => fetchData())

const name = ref('')
const readonly = ref(false)
const loading = ref(false)
const error = ref('')
const formValue = ref({
    name: ''
});
const rules = {
    phone: {
        required: true,
        message: 'Please input project name',
        trigger: ['input']
    }
};

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

const handleValidateClick = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate((errors) => {
        if (!errors) {
            message.success('Valid')
            api?.saveProject(props.projectId, { name: name.value }, (data: any, err: string) => {
                loading.value = false;
                if (err) {
                    error.value = err;
                    return;
                }
                // console.log('events', events)
                // events.emit('projects');
                // message.value = 'Settings were successfully updated.';
                if (!props.projectId) {
                    const projectId = data.trim();
                    router.replace({ name: 'project_settings', params: { projectId, tab: 'prometheus' } }).catch((err) => err);
                }
            });
        }
        else {
            error.value = 'error'
            console.log(errors)
            message.error('Invalid')
        }
    })
}

// const save = () => {
//     if (!valid.value) {
//         return;
//     }
//     loading.value = true;
//     error.value = '';
//     message.value = '';
//     api?.saveProject(props.projectId, { name: name.value }, (data: any, err: string) => {
//         loading.value = false;
//         if (err) {
//             error.value = err;
//             return;
//         }
//         // console.log('events', events)
//         // events.emit('projects');
//         message.value = 'Settings were successfully updated.';
//         if (!props.projectId) {
//             const projectId = data.trim();
//             router.replace({ name: 'project_settings', params: { projectId, tab: 'prometheus' } }).catch((err) => err);
//         }
//     });
// };
</script>

<template>
    <n-form ref="formRef" inline :label-width="80" :model="formValue" :rules="rules" :size="'medium'"
        :disabled="readonly">
        <n-alert title="Default Text" type="default">
            Gee it's good to be back home
        </n-alert>
        <div class="caption">
            Project is a separate infrastructure or environment, e.g. <var>production</var>, <var>staging</var> or
            <var>prod-us-west</var>.
        </div>

        <n-form-item label="Name" path="user.name">
            <n-input v-model:value="formValue.name" placeholder="Project name" />
        </n-form-item>
        <n-form-item>
            <n-button @click="handleValidateClick">
                Validate
            </n-button>
        </n-form-item>
    </n-form>


    <!-- <v-form v-model="valid" ref="form" style="max-width: 800px">
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
    </v-form> -->
</template>
