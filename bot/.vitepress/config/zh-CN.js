import { defineConfig } from 'vitepress'

export default defineConfig({
    label: '简体中文',
    lang: 'zh-CN',
    description: "一个高性能、易用、多品种、多策略、多周期、多账户的事件驱动交易机器人。",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: '主页', link: '/zh-CN' },
            { text: '文档', link: '/zh-CN/start' },
            { text: 'API', link: '/zh-CN/api' }
        ],

        sidebar: [
            {
                text: '开始',
                items: [
                    { text: '介绍', link: '/zh-CN/start' },
                    { text: '快速开始', link: '/zh-CN/quick_start' },
                    { text: '安装', link: '/zh-CN/install' },
                    { text: '初始化项目', link: '/zh-CN/init_project' },
                    { text: '命令行', link: '/zh-CN/bot_usage' },
                    { text: 'Banbot基础', link: '/zh-CN/basic' },
                    { text: '配置', link: '/zh-CN/configuration' },
                    { text: '自定义策略', link: '/zh-CN/strat_custom' },
                    { text: '品种管理器', link: '/zh-CN/pair_filters' },
                    { text: '超参数优化', link: '/zh-CN/hyperopt' },
                    { text: '滚动优化回测', link: '/zh-CN/roll_btopt' },
                    { text: '常见问题', link: '/zh-CN/faq' }
                ]
            },{
                text: '进阶',
                items: [
                    {text: 'K线工具', link: '/zh-CN/advanced/kline_tools'},
                    {text: 'AI', link: '/zh-CN/advanced/ai'}
                ]
            }
        ],

        docFooter: {
            prev: '上一篇',
            next: '下一篇'
        },
        editLink: {
            pattern: 'https://github.com/banbox/bandoc/edit/master/bot/:path',
            text: '在 GitHub 上编辑此页面'
        },
        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'medium'
            }
        },
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        outline: {
            label: '页面导航'
        },
        returnToTopLabel: '返回顶部',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式'
    }
})

export const search = {
    'zh-CN': {
        placeholder: '搜索文档',
        translations: {
            button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
            },
            modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                    selectText: '选择',
                    navigateText: '切换',
                    closeText: '关闭',
                }
            }
        }
    }
}