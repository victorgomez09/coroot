<!-- <template>
  <v-list-item-group v-model="theme">
    <v-list-item
      v-for="(icon, name) in themes"
      @click="setTheme(name)"
      :value="name"
    >
      <v-icon small class="mr-1">{{ icon }}</v-icon>
      {{ name }}
    </v-list-item>
  </v-list-item-group>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";

const storage = inject<any>("$storage");

const theme = ref(storage.local("theme") || "auto");

const setTheme = (theme) => {
  const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
  if (theme) {
    theme.value = theme;
    storage.local("theme", theme.value);
  } else {
    matchMedia.addEventListener("change", (e) => {
      const theme = storage.local("theme") || "auto";
      if (theme === "auto") {
        this.$vuetify.theme.dark = e.matches;
      }
    });
  }
  this.theme = this.$storage.local("theme") || "auto";
  if (this.theme === "auto") {
    this.$vuetify.theme.dark = matchMedia.matches;
  } else {
    this.$vuetify.theme.dark = this.theme === "dark";
  }
};
// export default {
//     data() {
//         return {
//             theme: this.$storage.local('theme') || 'auto',
//         };
//     },

//     computed: {
//         themes() {
//             return {
//                 light: 'mdi-weather-sunny',
//                 dark: 'mdi-weather-night',
//                 auto: 'mdi-theme-light-dark',
//             };
//         },
//     },

//     created() {
//         this.setTheme();
//     },

//     methods: {
//         setTheme(theme) {
//             const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
//             if (theme) {
//                 this.theme = theme;
//                 this.$storage.local('theme', this.theme);
//             } else {
//                 matchMedia.addEventListener('change', (e) => {
//                     const theme = this.$storage.local('theme') || 'auto';
//                     if (theme === 'auto') {
//                         this.$vuetify.theme.dark = e.matches;
//                     }
//                 });
//             }
//             this.theme = this.$storage.local('theme') || 'auto';
//             if (this.theme === 'auto') {
//                 this.$vuetify.theme.dark = matchMedia.matches;
//             } else {
//                 this.$vuetify.theme.dark = this.theme === 'dark';
//             }
//         },
//     },
// };
</script> -->
