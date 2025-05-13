<script setup lang="ts">
import 'uplot/dist/uPlot.min.css';
import uPlot from 'uplot';
import { onMounted, ref, nextTick, onBeforeUnmount, watch, computed, useTemplateRef } from 'vue'
// import { palette } from '../utils/colors';
import convert from 'color-convert';
import ChartAnnotations from './ChartAnnotations.vue';
import ChartIncidents from './ChartIncidents.vue';
import ChartTooltip from './ChartTooltip.vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    chart: Object,
    selection: Object,
    loading: Boolean,
    doc: String,
});

const route = useRoute()
const ch = ref<any>(null)
const bbox = ref<any>(null)
const idx = ref<any>(null)
const hiddenSeries = ref<any>((props.chart?.series || []).filter((s: any) => s.hidden).map((s: any) => s.name))
const highlightedSeries = ref<any>(null);

onMounted(() => {
    nextTick(redraw)
});

onBeforeUnmount(() => {
    ch.value && ch.value.destroy();
})

const theme = computed(() => {
    return {
        text: 'rgba(255, 255, 255, 0.4)',
        grid: 'rgba(255, 255, 255, 0.3)',
    };
});
const config = computed(() => {
    const c = JSON.parse(JSON.stringify(props.chart));
    c.series = (c.series || []).filter((s: any) => s.data != null);

    if (!c.sorted) {
        c.series.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
    delete c.sorted;

    if (c.threshold) {
        c.threshold.stacked = false;
        c.series.push(c.threshold);
        delete c.threshold;
    }

    c.ctx.data = Array.from({ length: (c.ctx.to - c.ctx.from) / c.ctx.step + 1 }, (_, i) => c.ctx.from + i * c.ctx.step);

    const colors: any = {};
    c.series
        .filter((s: any) => s.color)
        .forEach((s: any, i: any) => {
            if (!colors[s.color]) {
                colors[s.color] = [];
            }
            colors[s.color].push(i);
        });

    c.series.forEach((s: any, i: any) => {
        s.stacked = s.stacked !== undefined ? s.stacked : c.stacked;
        if (s.color === 'black') {
            s.color = 'white';
        }
        if (colors[s.color] && colors[s.color].length > 1) {
            // const c = palette.get(s.color, 0);
            const hsl = convert.hex.hsl(c);
            const idx = colors[s.color].findIndex((ii: any) => ii === i);
            hsl[2] = 70 - Math.trunc((idx * 30) / colors[s.color].length);
            s.color = '#' + convert.hsl.hex(hsl);
        } else {
            // s.color = palette.get(s.color, i + (c.color_shift || 0));
        }
        s.fill = s.stacked || s.fill;
    });
    delete c.stacked;
    return c;
});
const link = computed(() => {
    const link = config.value.drill_down_link;
    if (!link) {
        return undefined;
    }
    const query = { ...route.query, ...link.query };
    return { ...link, query };
});
const annotations = computed(() => {
    return (config.value.annotations || []).filter((a: any) => a.name !== 'incident').map((a: any) => ({ msg: a.name, x: a.x1, icon: a.icon }));
});
const incidents = computed(() => {
    return (config.value.annotations || []).filter((a: any) => a.name === 'incident').map((a: any) => ({ x1: a.x1, x2: a.x2 }));
});
const tooltip = computed(() => {
    const c = config.value;
    if (!c || idx.value === null) {
        return [];
    }
    const ss = c.series.filter(isActive);
    const max = ss.reduce((p: any, c: any) => Math.max(p, ...c.data), null);
    const f = fmtVal(max, c.unit, 2);
    return ss.map((s: any) => ({ label: s.name, value: f(s.data[idx.value]), color: s.color }));
});
const legend = computed(() => {
    const c = config.value;
    if (c.hide_legend) {
        return null;
    }
    return c.series.map((s: any) => ({ label: s.name, color: s.color, hidden: !isActive(s) }));
});

watch(config, () => {
    nextTick(redraw);
});
watch(() => props.selection, () => {
    const handler = (s: any) => {
        drawSelection(ch.value, s);
    }
});
watch(theme, () => {
    redraw();
});

function redraw() {
    const c = config.value;
    const ss = c.series.filter(isActive);
    const f = (s: any) => ({
        label: s.name,
        stroke: !s.stacked && s.color,
        width: c.column ? 0 : 2,
        fill: s.fill && s.color + (s.stacked ? 'ff' : '44'),
        points: { show: false },
        paths: c.column && uPlot?.paths?.bars!(),
    });
    const series = [];
    const data = [];
    const a = Array(c.ctx.data.length).fill(0);
    ss.forEach((_: any, i: number) => {
        const s = ss[ss.length - 1 - i];
        if (!s.stacked) {
            return;
        }
        series.unshift(f(s));
        data.unshift(s.data.map((v: any, i: any) => (a[i] += v)));
    });
    ss.filter((s: any) => !s.stacked).forEach((s: any) => {
        if (s.fill) {
            series.unshift(f(s));
            data.unshift(s.data);
        } else {
            series.push(f(s));
            data.push(s.data);
        }
    });
    if (!c.yzoom) {
        // fake series to show y == 0
        series.push({});
        data.push([0]);
    }
    const opts = {
        height: 150,
        padding: [10, 20, -10, 0],
        // width: this.$refs.uplot.clientWidth,
        ms: 1,
        axes: [
            {
                space: 80,
                font,
                // stroke: this.theme.text,
                // grid: { stroke: this.theme.grid },
                // ticks: { stroke: this.theme.grid },
                values: [
                    [60000, '{HH}:{mm}', null, null, '{MMM} {DD}', null, null, null, 0],
                    [1000, '{HH}:{mm}:{ss}', null, null, '{MMM} {DD}', null, null, null, 0],
                ],
            },
            {
                space: 20,
                font,
                size: 60,
                // stroke: this.theme.text,
                // grid: { stroke: this.theme.grid },
                // ticks: { stroke: this.theme.grid },
                values: (u: any, splits: any) => splits.map((v: any) => fmtVal(Math.max(...splits), c.unit)(v)),
            },
        ],
        series: [{}, ...series],
        cursor: {
            points: { show: false },
            y: false,
            drag: {
                setScale: false,
                click: () => { }, // allow `click` propagation for the selection buttons
            },
        },
        legend: { show: false },
        // plugins: [selectionPlugin(), this.$refs.tooltip.plugin()],
    } as any;

    if (ch.value) {
        ch.value.destroy();
    }
    ch.value = new uPlot(opts, [c.ctx.data, ...data], useTemplateRef('uplot').value as any);
    ch.value.root.style.font = font;
    bbox.value = Object.entries(ch.value.bbox).reduce((o: any, e: any) => {
        o[e[0]] = e[1] / devicePixelRatio;
        return o;
    }, {});
};
function drawSelection(u: any, s: any) {
    if (!u || !s) {
        return;
    }
    const opts = { left: 0, width: 0, height: 0 };
    if (s.to > s.from) {
        opts.left = u.valToPos(s.from, 'x');
        opts.width = u.valToPos(s.to, 'x') - opts.left;
        opts.height = u.bbox.height / devicePixelRatio;
    }
    u.setSelect(opts, false);
    setSelection(u, opts);
};
function setSelection(u: any, s: any) {
    const empty = s.width === 0;
    (useTemplateRef('selection') as any).value.style.display = empty || !props.selection?.mode ? 'none' : 'block';
    if (empty) {
        return;
    }

    const diffMode = props.selection?.mode === 'diff';

    const current = useTemplateRef('selection-current').value as any;
    current.style.width = s.width + 'px';
    current.style.left = s.left + 'px';

    const left = useTemplateRef('selection-left').value as any;
    left.style.display = diffMode ? 'block' : 'none';
    const lw = Math.min(s.width, s.left);
    left.style.width = lw + 'px';
    left.style.left = s.left - lw + 'px';

    const control = useTemplateRef('selection-control').value as any;
    const cw = control.getBoundingClientRect().width;
    const cl = diffMode ? s.left - cw / 2 : s.left + (s.width - cw) / 2;
    control.style.left = cl + 'px';
};
function setSelectionMode(m: any) {
    let { from, to } = props.selection!;
    if (!m) {
        from = 0;
        to = 0;
    }
    emitSelection({ mode: m, from, to });
};
function emitSelection(s: any) {
    const selection = { ...props.selection, ...s };
    const ctx = { from: config.value.ctx.from, to: config.value.ctx.to };
    // this.$emit('select', { selection, ctx });
};
function selectionPlugin() {
    if (!props.selection) {
        return {};
    }
    const init = (u: any) => {
        // u.over.appendChild(this.$refs.selection);
    };
    const ready = (u: any) => {
        drawSelection(u, props.selection);
    };
    const setCursor = (u: any) => {
        if (u.select.width === 0) {
            return;
        }
        setSelection(u, u.select);
    };
    const setSelect = (u: any) => {
        if (u.select.width === 0) {
            return;
        }
        const sl = u.select.left;
        const sw = u.select.width;
        const from = Math.trunc(u.posToVal(sl, 'x'));
        const to = Math.trunc(u.posToVal(sl + sw, 'x'));
        if (props.selection?.from === from || props.selection?.to === to) {
            return;
        }
        emitSelection({ from, to });
    };
    return { hooks: { init, ready, setCursor, setSelect } };
};
function toggleSeries(name: string) {
    const i = hiddenSeries.value.indexOf(name);
    if (i > -1) {
        hiddenSeries.value.splice(i, 1);
    } else {
        hiddenSeries.value.push(name);
    }
    highlightedSeries.value = null;
    redraw();
};
function highlightSeries(name: string | null) {
    highlightedSeries.value = name;
    redraw();
};
function isActive(s: any) {
    if (highlightedSeries.value) {
        return s.name === highlightedSeries.value;
    }
    return hiddenSeries.value.indexOf(s.name) < 0;
};

const font = '12px Roboto, sans-serif';

const suffixes1 = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const suffixes2 = ['', 'm', 'µ', 'n', 'p', 'f', 'a', 'z', 'y'];

const fmtVal = (max: number, unit: number, digits?: number) => {
    const p = !max ? 0 : Math.floor(Math.log(max) / Math.log(1000));
    const suffix = p > 0 ? suffixes1[p] : suffixes2[-p];

    return (v: any) => {
        if (v === null || isNaN(v)) {
            return '-';
        }
        let res: number | string = p < 0 ? v * Math.pow(1000, -p) : v / Math.pow(1000, p);
        if (digits !== undefined) {
            res = res.toFixed(digits);
        }
        return res + suffix + (unit || '');
    };
};
</script>

<template>
    <div ref="container" class="chart">
        <div class="title">
            <slot name="title">
                <span v-html="config.title"></span>
            </slot>
            <a v-if="doc" :href="doc" target="_blank" class="ml-1"><v-icon small>mdi-information-outline</v-icon></a>

            <button v-if="link" :to="link" class="btn btn-sm btn-primary ml-3">
                {{ link.title }}
            </button>
        </div>

        <div ref="uplot" v-on-resize="redraw" class="chart" :class="{ loading: loading }">
            <div v-if="selection" ref="selection" class="selection">
                <div ref="selection-control" class="selection-control">
                    <div class="join" v-if="selection.to > selection.from" @change="setSelectionMode">
                        <button value="diff">(mdi-select-compare)diff</button>
                        <button value="single">(mdi-magnify)single</button>
                        <button value="">(mdi-close)</button>
                    </div>
                    <!-- <v-btn-toggle v-if="selection.to > selection.from" :value="selection.mode"
                        @change="setSelectionMode">
                        <button value="diff">(mdi-select-compare)diff</button>
                        <button value="single"><v-icon small>mdi-magnify</v-icon></button>
                        <button value=""><v-icon small>mdi-close</v-icon></button>
                    </v-btn-toggle> -->
                </div>
                <div ref="selection-left" class="selection-left">
                    <span v-if="selection.mode === 'diff'" class="selection-title">baseline</span>
                </div>
                <div ref="selection-current" class="selection-current">
                    <span v-if="selection.mode === 'diff'" class="selection-title">comparison</span>
                </div>
            </div>

            <template v-if="!(selection && selection.to > selection.from && selection.mode)">
                <ChartAnnotations :ctx="config.ctx" :bbox="bbox" :annotations="annotations" />
            </template>
            <ChartIncidents :ctx="config.ctx" :bbox="bbox" :incidents="incidents" />
        </div>

        <ChartTooltip ref="tooltip" v-model="idx" :ctx="config.ctx" :incidents="incidents" class="tooltip">
            <div v-for="i in tooltip" class="item">
                <span class="marker" :style="{ backgroundColor: i.color }" />
                <span class="label">{{ i.label }}:</span>
                <span class="value">{{ i.value }}</span>
            </div>
        </ChartTooltip>

        <div v-if="legend" class="legend">
            <div v-for="l in legend" class="item" :style="{ opacity: l.hidden ? '0.5' : '1' }"
                @click="toggleSeries(l.label)" @mouseover="highlightSeries(l.label)"
                @mouseleave="highlightSeries(null)">
                <span class="marker" :style="{ backgroundColor: l.color }"></span>
                <span class="label">{{ l.label }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart {
    position: relative;
}

.chart:deep(.u-select) {
    background-color: var(--text-color);
    opacity: 0.12;
}

.title {
    font-size: 14px !important;
    font-weight: normal !important;
    text-align: center;
    line-height: 1.5em;
}

.selection {
    position: absolute;
    width: 100%;
    height: 100%;
}

.selection-control {
    position: relative;
    display: inline-block;
    transform: translateY(calc(-100% - 16px));
}

.selection-left {
    position: absolute;
    height: 100%;
    top: 0;
    border: 1px dashed var(--text-color-dimmed);
    border-right: none;
    border-bottom: none;
    color: rgba(0, 0, 0, 0.87);
}

.selection-current {
    position: absolute;
    height: 100%;
    top: 0;
    border: 1px solid var(--text-color-dimmed);
    border-bottom: none;
    color: rgba(0, 0, 0, 0.87);
}

.selection-title {
    position: absolute;
    top: -16px;
    font-style: italic;
    color: var(--text-color);
}

.selection-left .selection-title {
    right: 4px;
}

.selection-current .selection-title {
    left: 4px;
}

.tooltip .item {
    display: flex;
    align-items: center;
}

.tooltip .item .marker {
    height: 12px;
    width: 6px;
    margin-right: 4px;
}

.tooltip .item .label {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tooltip .item .value {
    flex-grow: 2;
    text-align: right;
    margin-left: 8px;
    font-weight: 600;
}

.legend {
    margin: 0 10px 0 40px;
    display: flex;
    flex-wrap: wrap;
    max-height: 36px;
    /* 2 lines of .items */
    overflow: auto;
}

.legend .item {
    padding-right: 10px;
    font-size: 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    max-width: 100%;
}

.legend .item .marker {
    width: 6px;
    height: 12px;
    padding-right: 6px;
}

.legend .item .label {
    margin-left: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.loading {
    pointer-events: none;
}
</style>
