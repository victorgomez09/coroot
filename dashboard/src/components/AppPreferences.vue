<script setup lang="ts">
import { EllipsisVertical } from 'lucide-vue-next';
import { inject } from 'vue';

const props = defineProps({
    app: Object,
    categories: [],
})

const utils = inject<any>("$utils")

function appPattern() {
    const id = utils.appId(props.app?.id);
    const ns = id.ns ? id.ns : '_';
    return ns + '/' + id.name;
};
</script>

<template>
    <button class="btn" popovertarget="popover-1" style="anchor-name:--anchor-1">
        <EllipsisVertical />
    </button>
    <ul class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm" popover id="popover-1"
        style="position-anchor:--anchor-1">
        <li v-if="app?.category && app.category !== 'application'">
            <RouterLink :to="{
                name: 'project_settings',
                params: { tab: 'applications' },
                hash: '#categories',
                query: {
                    category: app.category,
                },
            }">Edit the "{{ app.category }}" category</RouterLink>
        </li>
        <li class="font-thin"><a>Move the app to a category</a></li>
        <li>
            <RouterLink :to="{
                name: 'project_settings',
                params: { tab: 'applications' },
                hash: '#categories',
                query: {
                    app_pattern: appPattern(),
                },
            }">a new category</RouterLink>
        </li>
        <template v-if="categories">
            <li v-for="c in categories">
                <RouterLink :to="{
                    name: 'project_settings',
                    params: { tab: 'applications' },
                    hash: '#categories',
                    query: {
                        category: c,
                        app_pattern: appPattern(),
                    },
                }">
                    {{ c }}
                </RouterLink>
            </li>
        </template>
        <li v-if="app?.custom">
            <RouterLink :to="{
                name: 'project_settings',
                params: { tab: 'applications' },
                hash: '#custom-applications',
                query: { custom_app: utils.appId(app.id).name },
            }">
                Edit custom application
            </RouterLink>
        </li>
    </ul>

</template>
