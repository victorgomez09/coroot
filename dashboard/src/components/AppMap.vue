<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';

import Labels from './Labels.vue';
import AppHealth from './AppHealth.vue';
import AppIcon from './AppIcon.vue';
import AppPreferences from './AppPreferences.vue';

const collapseThreshold = 10;

const props = defineProps({
    map: Object
})

const utils = inject<any>("$utils")
const arrows = ref<any[]>([]);
const focused = ref<any>({})
const clientsExpanded = ref(false)
const dependenciesExpanded = ref(false)
const instancesExpanded = ref(false)

onMounted(() => {
    requestAnimationFrame(calcArrows);
});

watch(() => props.map, () => {
    requestAnimationFrame(calcArrows)
    unfocus()
});
watch(clientsExpanded, () => {
    requestAnimationFrame(calcArrows)
});
watch(dependenciesExpanded, () => {
    requestAnimationFrame(calcArrows)
});
watch(instancesExpanded, () => {
    requestAnimationFrame(calcArrows)
});

const clients = computed(() => {
    if (!props.map?.clients) {
        return [];
    }
    if (clientsExpanded.value) {
        return props.map.clients || [];
    }
    return props.map.clients.slice(0, collapseThreshold);
});
const dependencies = computed(() => {
    if (!props.map?.dependencies) {
        return [];
    }
    if (dependenciesExpanded.value) {
        return props.map.dependencies || [];
    }
    return props.map.dependencies.slice(0, collapseThreshold);
});
const instances = computed(() => {
    if (!props.map?.instances) {
        return [];
    }
    if (instancesExpanded.value) {
        return props.map.instances || [];
    }
    return props.map.instances.slice(0, collapseThreshold);
});
const highlighted = computed(() => {
    const res = {
        clients: new Set(),
        dependencies: new Set(),
        instances: new Set(),
    };
    const instances = props.map?.instances || [];
    if (focused.value.instance) {
        res.instances.add(focused.value.instance);
        const instance = instances.find((i: any) => i.id === focused.value.instance);
        if (!instance) {
            return res;
        }
        (instance.clients || []).forEach((a: any) => {
            res.clients.add(a.id);
        });
        (instance.dependencies || []).forEach((a: any) => {
            res.dependencies.add(a.id);
        });
        (instance.internal_links || []).forEach((l: any) => {
            res.instances.add(l.id);
        });
        instances.forEach((i: any) => {
            if (i.internal_links && i.internal_links.find((l: any) => l.id === focused.value.instance)) {
                res.instances.add(i.id);
            }
        });
    }
    if (focused.value.client) {
        res.clients.add(focused.value.client);
        instances.forEach((i: any) => {
            if (i.clients && i.clients.find((a: any) => a.id === focused.value.client)) {
                res.instances.add(i.id);
            }
        });
    }
    if (focused.value.dependency) {
        res.dependencies.add(focused.value.dependency);
        instances.forEach((i: any) => {
            if (i.dependencies && i.dependencies.find((a: any) => a.id === focused.value.dependency)) {
                res.instances.add(i.id);
            }
        });
    }
    return res;
});
const links = computed(() => {
    const links: any[] = [];
    const lo = (focused: any) => (Object.keys(focused).length ? 'lo' : '');

    (clients.value || []).forEach((a: any) => {
        const from = a.id;
        const to = props.map?.application.id;
        const hi = (focused: any) => (focused.client && focused.client === from ? 'hi' : lo(focused));
        links.push({ from, to, status: a.link_status, stats: a.link_stats, weight: a.link_weight, direction: a.link_direction, hi });
    });
    (dependencies.value || []).forEach((a: any) => {
        const from = props.map?.application.id;
        const to = a.id;
        const hi = (focused: any) => (focused.dependency && focused.dependency === to ? 'hi' : lo(focused));
        links.push({ from, to, status: a.link_status, stats: a.link_stats, weight: a.link_weight, direction: a.link_direction, hi });
    });

    return links;
});

function hideLabels(items: any[]) {
    return items && items.length > collapseThreshold;
};
function columnRowGap(items: any[]) {
    return (items && items.length > collapseThreshold ? 4 : 16) + 'px';
};
function focus(type: any, id: any) {
    focused.value = {};
    if (!props.map?.instances) {
        return;
    }
    focused.value[type] = id;
};
function unfocus() {
    focused.value = {};
};
function getRect(ref: any) {
    console.log('ref', ref)
    // TODO
    return {} as any
    // const el = this.$refs[ref] && (this.$refs[ref][0] || this.$refs[ref]);
    // if (!el) {
    //     return null;
    // }
    // return { top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight };
};
function calcArrows() {
    let arrows: any[] = [];
    links.value.forEach((l) => {
        const src = getRect(l.from);
        const dst = getRect(l.to);
        if (!src || !dst) {
            return;
        }
        const a: any = {
            hi: l.hi,
            status: l.status,
            _w: l.weight || 0,
            markerStart: l.direction === 'from' || l.direction === 'both',
            markerEnd: l.direction === 'to' || l.direction === 'both',
        };
        arrows.push(a);
        if (l.internal) {
            const x1 = src.left + src.width;
            const y1 = src.top + src.height / 2;
            const x2 = dst.left + dst.width;
            const y2 = dst.top + dst.height / 2;
            const r = Math.abs(y2 - y1);
            const rx = r;
            const ry = r;
            const sweep = y2 > y1 ? 1 : 0;
            a.d = `M${x1},${y1} A${rx},${ry} 0,0,${sweep} ${x2},${y2}`;
        } else {
            const x1 = src.left + src.width;
            const y1 = src.top + src.height / 2;
            const x2 = dst.left;
            const y2 = dst.top + dst.height / 2;
            a.d = `M${x1},${y1} L${x2},${y2}`;
            a.w = (as: any, hi: any) => (3 * a._w) / Math.max(...as.filter((a: any) => a.hi(hi) === 'hi').map((a: any) => a._w));
            a.r = (as: any, hi: any) => a.w(as, hi) / 2 + ((y2 - y1) ** 2 + (x2 - x1) ** 2) / (8 * a.w(as, hi));
            a.dd = (as: any, hi: any) =>
                `M${x1},${y1} A${a.r(as, hi)},${a.r(as, hi)} 0,0,0 ${x2},${y2} A${a.r(as, hi)},${a.r(as, hi)} 0,0,0 ${x1},${y1}`;
            if (l.stats && l.stats.length) {
                a.stats = { x: (x2 + x1) / 2 - 20, y: (y2 + y1) / 2 - (l.stats.length * 12) / 2, items: l.stats };
            }
        }
    });
    arrows = arrows;
};
</script>

<template>
    <div v-on-resize="calcArrows" class="map">
        <div class="column" :style="{ rowGap: columnRowGap(clients) }">
            <div v-for="app in clients" class="client" :ref="app.id" :class="{ hi: highlighted.clients.has(app.id) }"
                @mouseenter="focus('client', app.id)" @mouseleave="unfocus">
                <div>
                    <div class="d-flex align-center">
                        <div class="flex-grow-1 name">
                            <router-link
                                :to="{ name: 'overview', params: { view: 'applications', id: app.id }, query: utils.contextQuery() }">
                                <AppHealth :app="app" />
                            </router-link>
                        </div>
                        <AppIcon :icon="app.icon" class="ml-1" />
                    </div>
                    <Labels v-if="!hideLabels(clients)" :labels="app.labels" class="d-none d-sm-block label" />
                </div>
            </div>
            <div v-if="map?.clients">
                <button v-if="clientsExpanded" @click="clientsExpanded = false" class="btn btn-sm btn-primary">
                    collapse
                    (mdi-arrow-up)
                </button>
                <button v-else-if="map.clients.length > clients.length" x-small @click="clientsExpanded = true"
                    class="btn btn-sm btn-primary">
                    expand (+{{ map.clients.length - clients.length }} apps)
                </button>
            </div>
        </div>

        <div class="column">
            <div v-if="map?.application" class="app" :ref="map?.application.id">
                <div>
                    <div class="d-flex align-center">
                        <div class="flex-grow-1 name">
                            <AppHealth :app="map.application" />
                            <AppPreferences :app="map.application" :categories="map.categories" />
                        </div>
                        <AppIcon :icon="map.application.icon" />
                    </div>
                    <Labels :labels="map.application.labels" class="d-none d-sm-block label" />
                </div>
                <div v-if="instances && instances.length" class="instances">
                    <div v-for="i in instances" class="instance" :ref="'instance:' + i.id"
                        :class="{ hi: highlighted.instances.has(i.id) }">
                        <div class="d-flex align-center" style="gap: 2px">
                            <div class="name flex-grow-1" :title="i.id">{{ i.id }}</div>
                            <div>
                                ICONS
                                <!-- <v-icon v-if="i.labels && i.labels['role'] === 'primary'" small color="rgba(0,0,0,0.87)"
                                    style="margin-bottom: 2px">mdi-database-edit-outline</v-icon>
                                <v-icon v-if="i.labels && i.labels['role'] === 'replica'" small color="grey"
                                    style="margin-bottom: 2px">mdi-database-import-outline</v-icon>
                                <v-icon v-if="i.labels && i.labels['role'] === 'arbiter'" small color="grey"
                                    style="margin-bottom: 2px">mdi-database-eye-outline</v-icon>
                                <v-icon v-if="i.labels && i.labels['proxy']" small color="grey"
                                    style="margin-bottom: 2px">mdi-swap-horizontal</v-icon> -->
                                <template
                                    v-if="!map.application.custom && ['Unknown', 'ExternalService'].includes(utils.appId(map.application.id).kind)">
                                    <button class="btn" popovertarget="popover-1" style="anchor-name:--anchor-1">
                                        mdi-dots-vertical
                                    </button>
                                    <ul class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm" popover
                                        id="popover-1" style="position-anchor:--anchor-1">
                                        <li class="font-thin"><a>Move the instance to another application</a></li>
                                        <li>
                                            <RouterLink :to="{
                                                name: 'project_settings',
                                                params: { tab: 'applications' },
                                                hash: '#custom-applications',
                                                query: { custom_app: '', instance_pattern: i.id },
                                            }">a new application</RouterLink>
                                        </li>

                                        <template v-if="map.custom_applications">
                                            <li v-for="a in map.custom_applications">
                                                <RouterLink :to="{
                                                    name: 'project_settings',
                                                    params: { tab: 'applications' },
                                                    hash: '#custom-applications',
                                                    query: { custom_app: a, instance_pattern: i.id },
                                                }">
                                                    {{ a }}
                                                </RouterLink>
                                            </li>
                                        </template>
                                    </ul>
                                </template>
                            </div>
                        </div>
                        <Labels :labels="i.labels" class="d-none d-sm-block" />
                    </div>
                </div>
                <div v-if="map.instances">
                    <button v-if="instancesExpanded" @click="instancesExpanded = false"
                        class="btn btn-sm btn-primary">
                        collapse
                        (mdi-arrow-up)
                </button>
                    <button v-else-if="map.instances.length > instances.length" @click="instancesExpanded = true"
                        class="btn btn-sm btn-primary">
                        expand (+{{ map.instances.length - instances.length }} instances)
                    </button>
                </div>
            </div>
        </div>

        <div class="column" :style="{ rowGap: columnRowGap(dependencies) }">
            <div v-for="app in dependencies" class="dependency" :ref="app.id"
                :class="{ hi: highlighted.dependencies.has(app.id) }" @mouseenter="focus('dependency', app.id)"
                @mouseleave="unfocus">
                <div>
                    <div class="d-flex align-center">
                        <div class="flex-grow-1 name">
                            <router-link
                                :to="{ name: 'overview', params: { view: 'applications', id: app.id }, query: utils.contextQuery() }">
                                <AppHealth :app="app" />
                            </router-link>
                        </div>
                        <AppIcon :icon="app.icon" class="ml-1" />
                    </div>
                    <Labels v-if="!hideLabels(dependencies)" :labels="app.labels" class="d-none d-sm-block label" />
                </div>
            </div>
            <div v-if="map?.dependencies">
                <button v-if="dependenciesExpanded" @click="dependenciesExpanded = false" class="btn btn-sm btn-primary">
                    collapse
                    (mdi-arrow-up)
                </button>
                <button v-else-if="map.dependencies.length > dependencies.length"
                    @click="dependenciesExpanded = true" class="btn btn-sm btn-primary">
                    expand (+{{ map.dependencies.length - dependencies.length }} apps)
                </button>
            </div>
        </div>

        <svg>
            <defs>
                <template v-for="s in ['unknown', 'ok', 'warning', 'critical']">
                    <template v-for="m in ['', 'hi', 'lo']">
                        <marker :id="`marker-${s}-${m}`" class="marker" :class="`${s} ${m}`" viewBox="0 0 10 10"
                            refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse"
                            orient="auto-start-reverse">
                            <path d="M 0 3 L 10 5 L 0 7 z" />
                        </marker>
                    </template>
                </template>
            </defs>
            <template v-for="a in arrows">
                <path v-if="a.dd && a.hi(focused) === 'hi' && a.w(arrows, focused)" :d="a.dd(arrows, focused)"
                    class="arrow" :class="a.status" stroke="none" />
                <path :d="a.d" class="arrow" :class="[a.status, a.hi(focused)]" fill-opacity="0"
                    :marker-start="a.markerStart ? `url(#marker-${a.status}-${a.hi(focused)})` : ''"
                    :marker-end="a.markerEnd ? `url(#marker-${a.status}-${a.hi(focused)})` : ''" />
            </template>
        </svg>
        <template v-for="a in arrows">
            <div v-if="a.stats && a.hi(focused) === 'hi'" class="stats"
                :style="{ top: a.stats.y + 'px', left: a.stats.x + 'px' }">
                <div v-for="i in a.stats.items">{{ i }}</div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.map {
    display: flex;
    justify-content: space-between;
    line-height: 1.1;
    position: relative;
    gap: 16px;
    overflow-x: auto;
    padding: 10px 0;
}

.column {
    flex-basis: 10%;
    /* to keep some space if no clients or no dependencies */
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    align-self: center;
}

.app,
.client,
.dependency {
    max-width: 300px;
    border-radius: 3px;
    border: 1px solid #bdbdbd;
    white-space: nowrap;
    padding: 4px 8px;
}

.instances {
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.instance {
    border-radius: 3px;
    border: 1px solid #bdbdbd;
    white-space: nowrap;
    padding: 4px 8px;
    max-width: 16rem;
}

.name {
    white-space: nowrap;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.label {
    margin-left: 14px;
}

.hi {
    border: 1px solid var(--text-color);
    background-color: var(--background-color-hi);
}

svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* to allow interactions with html below */
    overflow: visible;
}

.arrow {
    stroke-width: 1.5;
    stroke-opacity: 0.8;
}

.arrow.hi {
    stroke-opacity: 1;
}

.arrow.lo {
    stroke-opacity: 0.3;
}

.arrow.unknown {
    fill: var(--status-unknown);
    stroke: var(--status-unknown);
    stroke-dasharray: 4;
}

.arrow.ok {
    fill: var(--status-ok);
    stroke: var(--status-ok);
}

.arrow.warning {
    fill: var(--status-warning);
    stroke: var(--status-warning);
    stroke-dasharray: 6;
}

.arrow.critical {
    fill: var(--status-critical);
    stroke: var(--status-critical);
    stroke-dasharray: 6;
}

.marker {
    fill-opacity: 0.5;
}

.marker.lo {
    fill-opacity: 0.1;
}

.marker.hi {
    fill-opacity: 1;
}

.marker.unknown {
    fill: var(--status-unknown);
}

.marker.ok {
    fill: var(--status-ok);
}

.marker.warning {
    fill: var(--status-warning);
}

.marker.critical {
    fill: var(--status-critical);
}

.stats {
    position: absolute;
    font-size: 12px;
    line-height: 12px;
    background-color: var(--background-color-hi);
    padding: 2px;
    border-radius: 2px;
    pointer-events: none;
}
</style>
