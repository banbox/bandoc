import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "banbot",
  description: "a high-performance, easy-to-use, multi-symbol, multi-strategy, multi-period, multi-account event-driven trading robot",

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en' },
          { text: 'Document', link: '/en/start' }
        ],

        sidebar: [
          {
            text: 'Start',
            items: [
              { text: 'Introduce', link: '/en/start' },
              { text: 'Prepare the development environment', link: '/en/install' },
              { text: 'Initialize the project', link: '/en/init_project' },
              { text: 'Banbot Basics', link: '/en/basic' },
              { text: 'Configuration', link: '/en/configuration' },
              { text: 'Custom Strategy', link: '/en/strat_custom' },
              { text: 'Symbol Manager', link: '/en/pair_filters' },
              { text: 'Startup Command', link: '/en/bot_usage' },
              { text: 'Hyperparameter optimization', link: '/en/hyperopt' },
              { text: 'Rolling optimization backtesting', link: '/en/roll_btopt' },
              { text: 'Q & A', link: '/en/faq' }
            ]
          }
        ],

        socialLinks: [
          { icon: 'github', link: 'https://github.com/banbox/banbot' }
        ],

      }
    },
    cn: {
      label: '中文',
      lang: 'cn',
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: '主页', link: '/cn' },
          { text: '文档', link: '/cn/start' }
        ],

        sidebar: [
          {
            text: '开始',
            items: [
              { text: '介绍', link: '/cn/start' },
              { text: '准备开发环境', link: '/cn/install' },
              { text: '初始化项目', link: '/cn/init_project' },
              { text: 'Banbot基础', link: '/cn/basic' },
              { text: '配置', link: '/cn/configuration' },
              { text: '自定义策略', link: '/cn/strat_custom' },
              { text: '品种管理器', link: '/cn/pair_filters' },
              { text: '启动命令', link: '/cn/bot_usage' },
              { text: '超参数优化', link: '/cn/hyperopt' },
              { text: '滚动优化回测', link: '/cn/roll_btopt' },
              { text: '常见问题', link: '/cn/faq' }
            ]
          }
        ],

        socialLinks: [
          { icon: 'github', link: 'https://github.com/banbox/banbot' }
        ],

      }
    }
  },
})
