import { createApp } from 'vue';

export default createApp({
    data() {
        return {
            events: {
                refresh: 0,
                projects: 0,
                roles: 0,
            },
        };
    },

    methods: {
        watch(component: any, handler: any, ...events: any) {
            events.forEach((event: any) => {
                if (this.events[event] === undefined) {
                    console.warn('unknown event:', event);
                    return;
                }
                component.$watch(
                    () => {
                        return this.events[event];
                    },
                    () => {
                        handler();
                    },
                );
            });
        },
        emit(event: any) {
            if (!this.events[event] === undefined) {
                console.warn('unknown event:', event);
                return;
            }
            this.events[event]++;
        },
    },
});
