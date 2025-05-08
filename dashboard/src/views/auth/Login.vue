<template>
    <div class="form">
        <div class="text-center">
            <!-- <img :src="`${$coroot.base_path}static/icon.svg`" alt=":~#" height="80" /> -->
            Alvi Observavility
        </div>

        <h2 class="text-h4 my-5 text-center">Welcome to Coroot</h2>

        <v-form v-model="valid" @submit.prevent="post" ref="form">
            <v-alert v-if="error" color="red" icon="mdi-alert-octagon-outline" outlined>
                {{ error }}
            </v-alert>
            <v-alert v-else-if="message" color="green" outlined>
                {{ message }}
            </v-alert>

            <div class="font-weight-medium">Email</div>
            <v-text-field outlined dense type="email" v-model="form.email" name="email" :rules="[validators?.notEmpty]"
                :disabled="set_admin_password" />

            <div class="font-weight-medium">Password</div>
            <v-text-field outlined dense type="password" v-model="form.password" name="password"
                :rules="[validators?.notEmpty]" />

            <template v-if="set_admin_password">
                <div class="font-weight-medium">Confirm password</div>
                <v-text-field outlined dense type="password" v-model="confirm_password"
                    :rules="[validators?.notEmpty, (v) => v === form.password || 'passwords do not match']" />
            </template>

            <v-btn block type="submit" :disabled="!valid" :loading="loading" color="primary" class="mt-5">
                <template v-if="set_admin_password"> Set Admin Password and Log In </template>
                <template v-else> Log In </template>
            </v-btn>
        </v-form>

        <div v-if="!set_admin_password" class="caption grey--text text-center mt-10">
            Contact your Coroot administrator if you forgot your email or password.
        </div>
    </div>
</template>

<script setup lang="ts">
import type Api from '@/api';
import { useRoute, useRouter } from 'vue-router'

const validators = inject<any>("$validators")
const api = inject<Api>("$api")
const route = useRoute()
const router = useRouter()

let form = {
    email: '',
    password: '',
    action: ''
};
let confirm_password = '';
let valid = false;
let error = '';
let message = '';
let loading = false;

const set_admin_password = computed(() => route.query.action === 'set_admin_password')

watch(set_admin_password, (v) => {
    if (v) {
        form.email = 'admin';
    }
})

const post = () => {
    loading = true;
    error = '';
    const parsedForm = { ...form };
    if (set_admin_password) {
        parsedForm.action = 'set_admin_password';
    }
    api?.login(parsedForm, (_: any, error: string) => {
        loading = false;
        if (error) {
            error = error;
            return;
        }
        router.push({ name: 'index' });
    });
};
</script>

<style scoped>
.form {
    max-width: 600px;
    margin: 100px auto;
}
</style>
