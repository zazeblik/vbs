const path = require('path');
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const { styles } = require('@ckeditor/ckeditor5-dev-utils');


module.exports = {
  outputDir: "../assets",
  transpileDependencies: [
    /ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/,
  ],
  configureWebpack: {
    plugins: [
      new CKEditorWebpackPlugin({
        language: 'en'
      })
    ]
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg');
    svgRule.exclude.add(path.join(__dirname, 'node_modules', '@ckeditor'));
    if (require('fs').existsSync('./portal.config.json')){
      const portalConfig = require('./portal.config.json');
      if (portalConfig){
        config
          .plugin('html')
          .tap(args => {
            if (portalConfig.title) args[0].title = portalConfig.title;
            if (portalConfig.headHtml) args[0].headHtml = portalConfig.headHtml;
            if (portalConfig.bottomHtml) args[0].bottomHtml = portalConfig.bottomHtml;
            let meta = {};
            if (portalConfig.description) meta.description = portalConfig.description;
            if (portalConfig.keywords) meta.keywords = portalConfig.keywords;
            args[0].meta = meta;
            return args
          })
      }
    }
    config.module
      .rule('cke-svg')
      .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
      .use('raw-loader')
      .loader('raw-loader');
    config.module
      .rule('cke-css')
      .test(/ckeditor5-[^/\\]+[/\\].+\.css$/)
      .use('postcss-loader')
      .loader('postcss-loader')
      .tap(() => {
        return styles.getPostCssConfig({
          themeImporter: {
            themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
          },
          minify: true
        });
      });
  }
}



