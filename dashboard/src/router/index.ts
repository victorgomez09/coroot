/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import App from "@/App.vue";
import Login from "@/views/auth/Login.vue";
import Overview from "@/views/Overview.vue";
import Project from "@/views/Project.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { anonymous: true },
  },
  { path: '/logout', name: 'logout', component: Login, meta: { anonymous: true } },
  { path: '/p/settings/:tab?', name: 'project_new', component: Project, props: true },
  {
    path: "/p/:projectId/:view?/:id?/:report?",
    name: "overview",
    component: Overview,
    props: true,
    meta: { stats: { params: ["view", "report"] } },
  },
  { path: "/", name: "index", component: App },
  { path: "/:catchAll(.*)", redirect: { name: "index" } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
  // scrollBehavior(to) {
  //   if (to.hash) {
  //     try {
  //       document.querySelector(to.hash);
  //       return new Promise((resolve) => {
  //         setTimeout(() => {
  //           resolve({ el: to.hash, behavior: "smooth" });
  //         }, 300);
  //       });
  //     } catch {
  //       //
  //     }
  //   }
  // },
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (!localStorage.getItem("vuetify:dynamic-reload")) {
      console.log("Reloading page to fix dynamic import error");
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    } else {
      console.error("Dynamic import error, reloading page did not fix it", err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

router.afterEach((to) => {
  if (to.matched[0]) {
    let p = to.matched[0].path;
    if (to.meta.stats && (to.meta.stats as any).params) {
      (to.meta.stats as any).params.forEach((name: any) => {
        const value = (to.meta.stats as any).params[name];
        p = p.replace(
          ":" + name,
          Array.isArray(value) ? value[0] : value || ""
        );
      });
    }
    // p = p.replaceAll('?', '');
    p = p.replace(/\?/g, "");
    if (!(to.meta.stats as any).params["id"]) {
      p = p.replace(":id", "");
    }
    if ((to.meta.stats as any).params.view === "traces" && to.query.query) {
      try {
        const q = JSON.parse(
          !Array.isArray(to.query.query) ? to.query.query : ""
        );
        const selection = q.ts_from || q.ts_to || q.dur_from || q.dur_to;
        p += `${q.view || ""}:${q.diff ? "diff" : ""}:${
          selection ? "selection" : ""
        }:${q.service_name ? "service" : ""}:${q.span_name ? "span" : ""}:${
          q.trace_id ? "id" : ""
        }:${q.include_aux ? "aux" : ""}`;
      } catch {
        //
      }
    }
    if (
      (to.meta.stats as any).params.view === "applications" &&
      (to.meta.stats as any).params.report === "Profiling" &&
      to.query.query
    ) {
      try {
        const q = JSON.parse(
          !Array.isArray(to.query.query) ? to.query.query : ""
        );
        p += `${q.type || ""}:${q.mode || ""}:${
          Number(q.from) || Number(q.to) ? "ts" : ""
        }`;
      } catch {
        //
      }
    }
    if (
      (to.meta.stats as any).params.view === "applications" &&
      (to.meta.stats as any).params.report === "Tracing" &&
      to.query.trace
    ) {
      const [type, id, ts, dur] = (
        !Array.isArray(to.query.trace) ? to.query.trace : ""
      ).split(":");
      p += `${type}:${id ? "id" : ""}:${ts !== "-" ? "ts" : ""}:${dur}`;
    }
    if (
      (to.meta.stats as any).params.view === "applications" &&
      (to.meta.stats as any).params.report === "Logs" &&
      to.query.query
    ) {
      try {
        const q = JSON.parse(
          !Array.isArray(to.query.query) ? to.query.query : ""
        );
        p += `${q.source || ""}:${q.view || ""}:${q.severity || ""}:${
          q.hash ? "hash" : ""
        }:${q.search ? "search" : ""}`;
      } catch {
        //
      }
    }
    // api.stats('route-open', { path: p });
  }
});

export default router;
