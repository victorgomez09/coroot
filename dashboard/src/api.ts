import axios, { type AxiosInstance } from "axios";
import * as storage from "./utils/storage";
import { v4 } from "uuid";
import type { Router } from "vue-router";

const defaultErrorMessage = "Something went wrong, please try again later.";
const timeoutErrorMessage = "Request timed out.";

export default class Api {
  axios: AxiosInstance | null = null;
  router: Router | null = null;
  // vuetify: any | null = null;
  deviceId = "";
  basePath = "";

  context = {
    status: {},
    search: {},
  };

  constructor(router: Router) {
    this.router = router;
    // this.vuetify = vuetify.framework;
    this.deviceId = storage.local("device-id");
    if (!this.deviceId) {
      this.deviceId = v4();
      storage.local("device-id", this.deviceId);
    }
    // this.basePath = "http://localhost:8080/";
    this.basePath = "https://humble-succotash-9q4p7qg9rxq3pqqw-8080.app.github.dev/";
    this.axios = axios.create({
      baseURL: this.basePath + "api/",
      timeout: 60000,
      timeoutErrorMessage,
      withCredentials: true,
    });
  }

  stats(type: any, data: any) {
    const event = {
      ...data,
      type,
      device_id: this.deviceId,
      // device_size: this.vuetify?.breakpoint.name,
      theme: storage.local("theme") || "",
    };
    navigator.sendBeacon(this.basePath + "stats", JSON.stringify(event));
  }

  request(req: any, cb: any) {
    this.axios!(req)
      .then((response: any) => {
        if (response.data.context) {
          this.context.status = response.data.context.status;
          this.context.search = response.data.context.search;
        }
        try {
          cb(response.data.data || response.data, "", response.status);
        } catch (e) {
          console.error(e);
        }
      })
      .catch((error) => {
        const status = error.response && error.response.status;
        const err =
          error.response && error.response.data && error.response.data.trim();
        if (status === 302) {
          window.location = err;
        }
        if (status === 401) {
          const r = this.router!.currentRoute.value;
          const action = err || undefined;
          if (!r.meta.anonymous || r.query.action !== action) {
            const next =
              r.fullPath !== "/" && r.name !== "login" ? r.fullPath : undefined;
            this.router!.push({ name: "login", query: { action, next } }).catch(
              (err) => err
            );
          }
        }
        cb(null, err || error.message || defaultErrorMessage, status);
      });
  }

  get(url: any, args: any, cb: any) {
    const { from, to, incident, rcaFrom, rcaTo } =
      this.router!.currentRoute.value.query;
    const params = { ...args, from, to, incident, rcaFrom, rcaTo };
    this.request({ method: "get", url, params }, cb);
  }

  put(url: any, data: any, cb: any) {
    this.request({ method: "put", url, data }, cb);
  }

  post(url: any, data: any, cb: any) {
    this.request({ method: "post", url, data }, cb);
  }

  del(url: any, cb: any) {
    this.request({ method: "delete", url }, cb);
  }

  user(form: any, cb: any) {
    if (form) {
      this.post(`user`, form, cb);
    } else {
      this.get(`user`, {}, cb);
    }
  }

  login(form: any, cb: any) {
    this.post(`login`, form, cb);
  }

  logout(cb: any) {
    this.post(`logout`, null, cb);
  }

  users(form: any, cb: any) {
    if (form) {
      this.post(`users`, form, cb);
    } else {
      this.get(`users`, {}, cb);
    }
  }

  roles(form: any, cb: any) {
    if (form) {
      this.post(`roles`, form, cb);
    } else {
      this.get(`roles`, {}, cb);
    }
  }

  sso(form: any, cb: any) {
    if (form) {
      this.post(`sso`, form, cb);
    } else {
      this.get(`sso`, {}, cb);
    }
  }

  ai(form: any, cb: any) {
    if (form) {
      this.post(`ai`, form, cb);
    } else {
      this.get(`ai`, {}, cb);
    }
  }

  getProject(projectId: any, cb: any) {
    this.get(`project/${projectId || ""}`, {}, cb);
  }

  saveProject(projectId: any, form: any, cb: any) {
    this.post(`project/${projectId || ""}`, form, cb);
  }

  delProject(projectId: any, cb: any) {
    this.del(`project/${projectId}`, cb);
  }

  projectPath(subPath: any) {
    const projectId = this.router!.currentRoute.value.params["projectId"];
    return `project/${projectId}/${subPath}`;
  }

  getStatus(cb: any) {
    this.get(this.projectPath(`status`), {}, cb);
  }

  apiKeys(form: any, cb: any) {
    const url = this.projectPath("api_keys");
    if (form) {
      this.post(url, form, cb);
    } else {
      this.get(url, {}, cb);
    }
  }

  getOverview(view: any, query: any, cb: any) {
    this.get(this.projectPath(`overview/${view}`), { query }, cb);
  }

  getInspections(cb: any) {
    this.get(this.projectPath(`inspections`), {}, cb);
  }

  applicationCategories(name: any, form: any, cb: any) {
    if (form) {
      this.post(this.projectPath(`application_categories`), form, cb);
    } else {
      this.get(this.projectPath(`application_categories`), { name }, cb);
    }
  }

  getCustomApplications(cb: any) {
    this.get(this.projectPath(`custom_applications`), {}, cb);
  }

  saveCustomApplication(form: any, cb: any) {
    this.post(this.projectPath(`custom_applications`), form, cb);
  }

  getCustomCloudPricing(cb: any) {
    this.get(this.projectPath(`custom_cloud_pricing`), {}, cb);
  }

  saveCustomCloudPricing(form: any, cb: any) {
    this.post(this.projectPath(`custom_cloud_pricing`), form, cb);
  }

  deleteCustomCloudPricing(cb: any) {
    this.del(this.projectPath(`custom_cloud_pricing`), cb);
  }

  getIntegrations(type: any, cb: any) {
    this.get(this.projectPath(`integrations${type ? "/" + type : ""}`), {}, cb);
  }

  saveIntegrations(type: any, action: any, form: any, cb: any) {
    const path = this.projectPath(`integrations${type ? "/" + type : ""}`);
    switch (action) {
      case "save":
        this.put(path, form, cb);
        return;
      case "del":
        this.del(path, cb);
        return;
      case "test":
        this.post(path, form, cb);
        return;
    }
  }

  getApplication(appId: any, cb: any) {
    this.get(this.projectPath(`app/${appId}`), {}, cb);
  }

  getIncident(key: any, cb: any) {
    this.get(this.projectPath(`incident/${key}`), {}, cb);
  }

  getRCA(appId: any, withSummary: any, cb: any) {
    this.get(this.projectPath(`app/${appId}/rca`), { withSummary }, cb);
  }

  getInspectionConfig(appId: any, type: any, cb: any) {
    this.get(
      this.projectPath(`app/${appId}/inspection/${type}/config`),
      {},
      cb
    );
  }

  saveInspectionConfig(appId: any, type: any, form: any, cb: any) {
    this.post(
      this.projectPath(`app/${appId}/inspection/${type}/config`),
      form,
      cb
    );
  }

  getInstrumentation(appId: any, type: any, cb: any) {
    this.get(this.projectPath(`app/${appId}/instrumentation/${type}`), {}, cb);
  }

  saveInstrumentationSettings(appId: any, type: any, form: any, cb: any) {
    this.post(
      this.projectPath(`app/${appId}/instrumentation/${type}`),
      form,
      cb
    );
  }

  getProfiling(appId: any, query: any, cb: any) {
    this.get(this.projectPath(`app/${appId}/profiling`), { query }, cb);
  }

  saveProfilingSettings(appId: any, form: any, cb: any) {
    this.post(this.projectPath(`app/${appId}/profiling`), form, cb);
  }

  getTracing(appId: any, trace: any, cb: any) {
    this.get(this.projectPath(`app/${appId}/tracing`), { trace }, cb);
  }

  saveTracingSettings(appId: any, form: any, cb: any) {
    this.post(this.projectPath(`app/${appId}/tracing`), form, cb);
  }

  getLogs(appId: any, query: any, cb: any) {
    this.get(this.projectPath(`app/${appId}/logs`), { query }, cb);
  }

  saveLogsSettings(appId: any, form: any, cb: any) {
    this.post(this.projectPath(`app/${appId}/logs`), form, cb);
  }

  getNode(nodeName: any, cb: any) {
    this.get(this.projectPath(`node/${nodeName}`), {}, cb);
  }

  risks(appId: any, form: any, cb: any) {
    this.post(this.projectPath(`app/${appId}/risks`), form, cb);
  }

  getPrometheusCompleteConfiguration() {
    return {
      remote: {
        apiPrefix:
          this.basePath + "api/" + this.projectPath("prom") + "/api/v1",
      },
    };
  }
}
