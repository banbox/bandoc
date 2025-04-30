import { defineConfig } from 'vitepress'
import {getApiMenus} from "./share";

export default defineConfig({
    label: 'English',
    lang: 'en-US',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/en-US' },
            { text: 'Document', link: '/en-US/guide/start' },
            { text: 'API', link: '/en-US/api' }
        ],

        sidebar: {
            '/en-US/': [
                {
                    text: 'Start',
                    items: [
                        { text: 'Introduce', link: '/en-US/guide/start' },
                        { text: 'Quick Experience (Docker)', link: '/en-US/guide/quick_docker' },
                        { text: 'Quick Start', link: '/en-US/guide/quick_local' },
                        { text: 'Install', link: '/en-US/guide/install' },
                        { text: 'Initialize the project', link: '/en-US/guide/init_project' },
                        { text: 'Banbot Basics', link: '/en-US/guide/basic' },
                        { text: 'Commands', link: '/en-US/guide/bot_usage' },
                        { text: 'Configuration', link: '/en-US/guide/configuration' },
                        { text: 'Custom Strategy', link: '/en-US/guide/strat_custom' },
                        { text: 'Symbol Manager', link: '/en-US/guide/pair_filters' },
                        { text: 'Live Trading', link: '/en-US/guide/live_trading' },
                        { text: 'Q & A', link: '/en-US/guide/faq' }
                    ]
                },{
                    text: 'Advanced',
                    items: [
                        {text: 'Custom commands', link: '/zh-CN/advanced/custom_cmd'},
                        {text: 'CandleStick Tools', link: '/en-US/advanced/kline_tools'},
                        { text: 'Hyperparameter optimization', link: '/en-US/guide/hyperopt' },
                        { text: 'Rolling optimization backtesting', link: '/en-US/guide/roll_btopt' },
                        {text: 'AI', link: '/en-US/advanced/ai'}
                    ]
                },{
                    text: 'DeepWiki',
                    items: [
                        {text: 'banbot', link: 'https://deepwiki.com/banbox/banbot'},
                        {text: 'banexg', link: 'https://deepwiki.com/banbox/banexg'},
                        {text: 'banta', link: 'https://deepwiki.com/banbox/banta'},
                    ]
                }
            ],
            '/en-US/api/': getApiMenus('/en-US')
        },
        editLink: {
            pattern: 'https://github.com/banbox/bandoc/edit/master/bot/:path',
            text: 'Edit this page on GitHub'
        }
    }
})

export const search = {
    'en-US': {
        placeholder: 'Search docs',
        translations: {
            button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search'
            },
            modal: {
                noResultsText: 'No results for',
                resetButtonTitle: 'Reset search',
                footer: {
                    selectText: 'to select',
                    navigateText: 'to navigate',
                    closeText: 'to close',
                }
            }
        }
    }
}