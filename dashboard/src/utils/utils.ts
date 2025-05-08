import type { Router } from "vue-router";

const emptyJson = JSON.stringify({});

export default class Utils {
    router: Router | null = null;

    constructor(router: Router) {
        this.router = router;
    }

    stateToUri(s: string) {
        const j = JSON.stringify(s);
        const hash = j === emptyJson ? undefined : '#' + encodeURIComponent(j);
        this.router?.replace({ hash }).catch((err) => err);
    }

    stateFromUri() {
        const j = decodeURIComponent(this.router?.currentRoute.value.hash.substring(1) || "");
        if (!j) {
            return {};
        }
        try {
            return JSON.parse(j);
        } catch {
            this.router?.replace({ hash: undefined });
            return {};
        }
    }

    appId(id: string) {
        const parts = id.split(':');
        return {
            ns: parts[0] !== '_' ? parts[0] : '',
            kind: parts[1],
            name: parts[3] ? parts[2] + ':' + parts[3] : parts[2],
        };
    }

    contextQuery() {
        const r = this.router?.currentRoute;
        if (!r) {
            return {};
        }
        const { from, to, incident } = r.value.query || {};
        return { from, to, incident };
    }
}
