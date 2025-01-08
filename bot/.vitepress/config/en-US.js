import { defineConfig } from 'vitepress'

export default defineConfig({
    label: 'English',
    lang: 'en-US',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/en-US' },
            { text: 'Document', link: '/en-US/start' },
            { text: 'API', link: '/en-US/api' }
        ],

        sidebar: [
            {
                text: 'Start',
                items: [
                    { text: 'Introduce', link: '/en-US/start' },
                    { text: 'Quick Start', link: '/en-US/quick_start' },
                    { text: 'Install', link: '/en-US/install' },
                    { text: 'Initialize the project', link: '/en-US/init_project' },
                    { text: 'Commands', link: '/en-US/bot_usage' },
                    { text: 'Banbot Basics', link: '/en-US/basic' },
                    { text: 'Configuration', link: '/en-US/configuration' },
                    { text: 'Custom Strategy', link: '/en-US/strat_custom' },
                    { text: 'Symbol Manager', link: '/en-US/pair_filters' },
                    { text: 'Hyperparameter optimization', link: '/en-US/hyperopt' },
                    { text: 'Rolling optimization backtesting', link: '/en-US/roll_btopt' },
                    { text: 'Q & A', link: '/en-US/faq' }
                ]
            },{
                text: 'Advanced',
                items: [
                    {text: 'CandleStick Tools', link: '/en-US/advanced/kline_tools'},
                    {text: 'AI', link: '/en-US/advanced/ai'}
                ]
            }
        ],
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