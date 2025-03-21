banbot是一个高性能、易用、多品种、多策略、多周期、多账户的事件驱动交易机器人。支持回测、超参数调优和实盘交易。
目前仅支持币安交易所，可通过WebUI查看机器人。
::: danger 免责声明
本软件仅用于研究和教育目的，请勿投入超过您承受能力的资金。使用本软件风险自负。作者和所有关联方对您的交易结果不承担任何责任。  

请先进行充分回测、滚动测试、模拟实时交易后，再考虑小金额运行交易机器人，在了解其工作原理以及应预期的利润/损失之前，不要投入资金。  

我们强烈建议您具备基本的golang编程知识，以及通过阅读源代码了解机器人的运行机制。
:::

## 主要特征
* 高性能：1秒回测1年的数据（基于5m测试，具体耗时取决于策略特点）
* 易用：一个版本的策略，同时支持回测、模拟实时交易和实盘
* 灵活：自由组合不同的品种、策略和时间周期
* 事件驱动：杜绝未来信息，更自由地实现您的策略逻辑
* 规模化：可将一批策略同时应用到多个交易所账户
* 超参数调优：支持bayes/tpe/random/cmaes/ipop-cmaes/bipop-cmaes
* websocket：交易所逐笔交易+订单簿数据
* 指标库：内置[banta](https://github.com/banbox/banta)高性能指标库，您可基于其快速开发自定义指标

## WebUI
![image](https://www.banbot.site/uidev.gif)

## 支持的交易所
基于[banexg](https://github.com/banbox/banexg)提供的统一接口，目前仅支持币安交易所，但也能比较容易对接其他交易所。

| logo                                                                                                            | id      | name              | ver | websocket | 
|-----------------------------------------------------------------------------------------------------------------|---------|-------------------|-----|-----------|
| ![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg) | binance | spot/usd-m/coin-m | *   | Y         |

## 技能要求
* Linux/Windows基本操作（环境变量、命令行、编辑配置文件）
* golang语言基础（[快速入门](https://go.dev/tour/welcome/2)）
* 量化交易基础知识
::: tip tip
建议您通过DeepSeek快速学习相关基础知识
:::

## 安装要求
### 硬件要求
推荐您使用不低于此配置的linux云服务器：
* 内存：2GB
* 磁盘：10GB
* CPU：2核
::: tip tip
此配置可同时部署数据库和机器人，每个机器人单个账户占用资源极小，您可在单个机器人进程中配置数百个账户。
:::

## Q & A
**策略项目和banbot有什么区别？我需要拉取banbot源代码吗？**

您不需要拉取banbot的源码，只需在您的策略项目中通过`go get`引用banbot最新版本即可。  
策略项目就是您维护所有策略代码的go项目，也是直接用来`go build`编译为单个可执行文件的地方。

**文档看不明白怎么办？**

您可下载此文档的[github仓库](https://github.com/banbox/bandoc/)，然后使用cursor打开，在chat中@codebase，提问你想知道的任意内容；cursor将会结合文档的所有内容，对您做出更容易理解的解释。

**[更多常见问题](./faq.md)**

## 社区支持
对于文档中任何未覆盖到的问题，或需要有关机器人的更多信息，或只是互相交流，欢迎添加开发者微信，备注banbot，加入群聊。
<img style="width:180px;margin-top:10px" src="/img/wechat.jpg"/>

### 其他社群
[Discord服务器](https://discord.com/invite/XXjA8ctqga)

[telegram群组](https://t.me/banbot_quant)
