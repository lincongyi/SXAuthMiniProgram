const path = require('path')
const CIPluginOpt = {
  // 微信小程序
  weapp: {
    appid: 'wxba14eaf2d4b819a9',
    privateKeyPath: './private.wxba14eaf2d4b819a9.key',
  },

  // 版本号
  version: '1.0.0',
  // 版本发布描述
  desc: 'v1.0.0'
}
const config = {
  projectName: 'SXAuthMiniProgram',
  date: '2022-6-6',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  plugins: ['@tarojs/plugin-html', ['@tarojs/plugin-mini-ci', CIPluginOpt]],
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'vue3',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: [/nut-/]
        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  sass: {
    resource: [
      path.resolve(__dirname, '..', 'src/assets/styles/theme.scss')
    ],
    data: '@import "@nutui/nutui-taro/dist/styles/variables.scss";',
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    '@api': path.resolve(__dirname, '..', 'src/api'),
    '@styles': path.resolve(__dirname, '..', 'src/assets/styles'),
    '@utils': path.resolve(__dirname, '..', 'src/utils'),
    '@images': path.resolve(__dirname, '..', 'src/images'),
    '@components': path.resolve(__dirname, '..', 'src/components'),
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  } else if (process.env.NODE_ENV === 'release') {
    return merge({}, config, require('./release'))
  } else {
    return merge({}, config, require('./prod'))
  }
}
