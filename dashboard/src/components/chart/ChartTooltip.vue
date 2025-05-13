<script setup lang="ts">
import { computed, inject, ref } from 'vue'

const tsFormat = '{MMM} {DD}, {HH}:{mm}:{ss}';
const tsFormatShort = '{MMM} {DD}, {HH}:{mm}';

const props = defineProps({
    ctx: Object,
    incidents: Array,
});

const format = inject < any > ("$format")
const idx = ref < any > ()
const mousedown = ref < boolean > (false)

const ts = computed(() => {
    return props.ctx?.data[idx.value];
});
const time = computed(() => {
    return format.date(ts.value, tsFormat);
});
const incident = computed(() => {
    const incident: any = (props.incidents || []).find((o: any) => o.x1 <= ts.value && ts.value <= o.x2);
    if (!incident) {
        return null;
    }
    const long = incident.x2 - incident.x1 > 3600000;
    const fmt = long ? tsFormatShort : tsFormat;
    const precision = long ? 'm' : 's';
    return {
        from: format.date(incident.x1, fmt),
        to: incident.x2 < props.ctx?.to && format.date(incident.x2, fmt),
        dur: format.duration(incident.x2 - incident.x1 + props.ctx?.step, precision),
    };
});

function plugin() {
    const init = (u: any) => {
        const t = this.$refs.tooltip;
        u.over.appendChild(t);
        u.over.addEventListener('mouseleave', () => {
            t.style.display = 'none';
            this.mousedown = false;
        });
        u.over.addEventListener('mousedown', () => {
            t.style.display = 'none';
            this.mousedown = true;
        });
        u.over.addEventListener('mouseup', () => {
            this.mousedown = false;
        });
    };
    const setCursor = (u) => {
        const { left, top, idx } = u.cursor;
        if (idx === null) {
            return;
        }
        this.idx = idx;
        this.$emit('input', idx);
        const t = this.$refs.tooltip;
        const l = left - (left >= u.over.clientWidth / 2 ? t.clientWidth + 5 : -5);
        t.style.transform = 'translate(' + l + 'px, ' + top + 'px)';
        if (!this.mousedown) {
            t.style.display = 'block';
        }
    };
    return { hooks: { init, setCursor } };
}
</script>


<template>
    <div ref="tooltip" class="tooltip">
        <div class="time">{{ time }}</div>
        <slot></slot>
        <div v-if="incident" class="incident">
            <span class="label">incident</span>: {{ incident.from }} - {{ incident.to || 'in progress' }} ({{
            incident.dur }})
        </div>
    </div>
</template>


<style scoped>
.tooltip {
    display: none;
    position: absolute;
    z-index: 2;
    background-color: var(--tooltip-color);
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    pointer-events: none;
    font-size: 12px;
    opacity: 90%;
}

.tooltip .time {
    text-align: center;
    margin-bottom: 8px;
}

.tooltip .incident {
    margin-top: 10px;
    padding-top: 5px;
    border-top: 1px solid black;
}

.tooltip .incident .label {
    color: hsl(4, 90%, 58%);
    font-weight: 600;
}
</style>
