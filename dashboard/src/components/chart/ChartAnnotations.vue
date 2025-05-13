<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    ctx: Object,
    bbox: Object,
    annotations: Array,
})

const items = computed(() => {
    if (!props.annotations?.length || !props.bbox) {
        return [];
    }
    const ctx = props.ctx;
    const b = props.bbox;
    const norm = (x: any) => (x - ctx?.from) / (ctx?.to - ctx?.from);

    return props.annotations?.map((a: any) => {
        return {
            msg: a.msg,
            icon: a.icon || 'mdi-alert-circle-outline',
            style: {
                left: b.left + b.width * norm(a.x) + 'px',
                height: b.top + b.height + 'px',
            },
        };
    });
});
</script>

<template>
    <div class="annotations">
        <div v-for="i in items" class="annotation" :style="i.style">
            <div class="tooltip">
                <div class="tooltip-content">
                    <div class="card">
                        <div class="card-body p-2">
                            {{ i.msg }}
                        </div>
                    </div>
                </div>
                <button class="btn">{{ i.icon }}</button>
            </div>
            Force o
            <div class="line"></div>
        </div>
    </div>
</template>

<style scoped>
.annotation {
    z-index: 1;
    position: absolute;
    transition: none;
    display: flex;
    flex-direction: column;
    width: 0;
}

.line {
    flex-grow: 1;
    border-left: 0.08rem dashed var(--text-color);
    margin-left: -0.04rem;
    pointer-events: none;
}
</style>
