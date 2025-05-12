<script setup lang="ts">
import {
  computed,
  h,
  inject,
  isProxy,
  onMounted,
  ref,
  toRaw,
  type Component,
} from "vue";
import type { User } from "./models/user.model";
import type Api from "./api";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  NIcon,
  NText,
  type MenuOption,
  type SelectRenderLabel,
  type SelectRenderTag,
} from "naive-ui";
import { BookIcon } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const api = inject<Api>("$api")!;
const utils = inject<any>("$utils")!;
const storage = inject<any>("$storage")!;
const user = ref<User | null>(null);
const activeKey = ref<string | null>(null);
const collapsed = ref(true);
const context = api.context;
const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "overview",
            params: {
              view: "applications",
              id: undefined,
              report: undefined,
            },
            query: utils?.contextQuery(),
          },
        },
        { default: () => "Applications" }
      ),
    key: "hear-the-wind-sing",
    icon: renderIcon(BookIcon),
  },
  {
    label: "Pinball 1973",
    key: "pinball-1973",
    icon: renderIcon(BookIcon),
    disabled: true,
    children: [
      {
        label: "Rat",
        key: "rat",
      },
    ],
  },
];

onMounted(() => getUser());

const projects = computed(() => (!user.value ? [] : user.value.projects || []));
const project = computed(() => {
  const id = route.params.projectId;
  if (!id) {
    return null;
  }

  return projects.value.find((p) => p.id === id);
});
const status = computed(() => (!project.value ? null : context.status));

const getUser = () => {
  if (route.meta.anonymous) {
    return;
  }

  api.user(null, (data: any, error: string) => {
    if (error) {
      user.value = null;
      return;
    }

    user.value = data;
    if (route.name === "index" && projects.value.length) {
      let id = projects.value[0].id;
      const lastId = lastProject();
      if (lastId && projects.value.find((p) => p.id === lastId)) {
        id = lastId;
      }

      router.replace({ name: "overview", params: { projectId: id } });
    }
  });
};
const lastProject = (id?: string) => {
  return storage.local("last-project", id);
};
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}
const renderLabel: SelectRenderLabel = (option) => {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
      },
    },
    [
      h(
        "div",
        {
          style: {
            marginLeft: "12px",
            padding: "4px 0",
          },
           onClick: () => router.push({
            name: "overview",
             params: { projectId: p.id }
          })
        },
        [
          h("div", null, [
            isProxy(option)
              ? (toRaw(option) as any).name
              : (option as any).name,
            ]),
        ]
      ),
    ]
  );
};
const renderSingleSelectTag: SelectRenderTag = ({ option }) => {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
      },
    },
    [(option.value as any)?.name || ""]
  );
};
</script>

<template>
  <div class="flex w-full h-full">
    <n-layout has-sider>
      <n-layout-sider
        v-if="user"
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <n-menu
          v-model:value="activeKey"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
        />

        {{ project }}
        <n-select
          v-model:value="project"
          :options="projects"
          :render-label="renderLabel"
          :render-tag="renderSingleSelectTag"
          class="!w-10/12"
        />
      </n-layout-sider>

      <div class="flex flex-col gap-2 p-2 ms-2 w-full h-full">
        <Welcome
        v-if="route.name === 'index' && user && !projects.length"
        :user="user"
        />
        
        <router-view v-else />
      </div>
    </n-layout>
  </div>
</template>
