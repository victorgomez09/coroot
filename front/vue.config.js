const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  publicPath: '{{.BasePath}}static/',
  transpileDependencies: [
    'vuetify',
    '@prometheus-io/codemirror-promql',
    'sql-formatter'
  ],

   chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat')

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
  }
});
