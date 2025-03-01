Banbot is a high-performance, easy-to-use, multi-variety, multi-strategy, multi-period, multi-account event-driven trading robot. It supports backtesting, hyperparameter tuning, and real-time trading.
Currently only supports Binance Exchange, and the robot can be viewed through the WebUI.
::: danger Disclaimer
This software is for research and educational purposes only. Do not invest more money than you can afford. Use this software at your own risk. The author and all related parties are not responsible for your trading results.

Please conduct sufficient backtesting, rolling testing, and simulated real-time trading before considering running the trading robot with a small amount. Do not invest money before understanding how it works and the expected profit/loss.

We strongly recommend that you have basic golang programming knowledge and understand the robot's operating mechanism by reading the source code.
:::

## Main features
* High performance: 1 second backtesting 1 year of data (based on 5m test, the specific time depends on the characteristics of the strategy)
* Easy to use: one version of the strategy, supporting backtesting, simulated real-time trading and real trading at the same time
* Flexible: Freely combine different symbols, strategies and time periods
* Event-driven: No lookahead and implement your strategy logic more freely
* Scalability: A batch of strategies can be applied to multiple exchange accounts at the same time
* Hyperparameter tuning: Support bayes/tpe/random/cmaes/ipop-cmaes/bipop-cmaes
* Websocket: Exchange transaction by transaction + order book data
* Indicator library: Built-in [banta](https://github.com/banbox/banta) high-performance indicator library, you can quickly develop custom indicators based on it

## WebUI
![image](https://www.banbot.site/uidev.gif)

## Supported exchanges
Based on the unified interface provided by [banexg](https://github.com/banbox/banexg), currently only supports Binance Exchange, but it can also be easily connected to other exchanges.

| logo                                                                                                            | id      | name              | ver | websocket |
|-----------------------------------------------------------------------------------------------------------------|---------|-------------------|-----|-----------|
| ![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg) | binance | spot/usd-m/coin-m | *   | Y         |

## Skill Requirements
* Basic Linux/Windows operations (environment variables, command line, editing configuration files)
* Fundamentals of the Go language ([Quick Start](https://go.dev/tour/welcome/2))
* Basic knowledge of quantitative trading
::: tip tip
It is recommended that you quickly learn the relevant basics through DeepSeek
:::

## Installation Requirements
### Hardware Requirements
It is recommended that you use a Linux cloud server with a configuration no less than this:
* Memory: 2GB
* Disk: 10GB
* CPU: 2 cores
::: tip tip
This configuration allows for the simultaneous deployment of both the database and the bot. Each bot account occupies minimal resources, enabling you to configure hundreds of accounts within a single bot process.
:::

## Q & A
**Why are precompiled installation packages not provided?**

Most quantitative strategies require writing code independently. To balance development efficiency and maximize performance, banbot chooses golang as the unified language for both the system and strategies, which also provides users with the greatest freedom.  
The philosophy of golang is to compile everything (banbot and your strategy code) into a single executable file, which you can easily distribute to anyone and run directly.  
So you only need to [pull the example strategy project](./init_project.md), use the built-in strategies or implement your own, and after compilation, you can experience all functions such as backtesting and live trading.

**What is the difference between the strategy project and banbot? Do I need to pull the banbot source code?**

You do not need to pull the banbot source code; you only need to reference the latest version of banbot via `go get` in your strategy project.  
The strategy project is the go project where you maintain all your strategy code, and it is also the place where you directly use `go build` to compile into a single executable file.

**What should I do if I don't understand the document?**

You can download the [GitHub repository](https://github.com/banbox/bandoc/) of this document, then open it with Cursor, and @codebase in the chat to ask any questions you have; Cursor will combine all the content of the document to provide you with a more understandable explanation.

## Community Support
For any questions not covered in the documentation, or if you need more information about the robot, or just want to communicate with each other, 
please join our [Discord server](https://discord.com/invite/XXjA8ctqga)

[telegram group](https://t.me/banbot_quant)

### Other communities
Due to time difference or network problems in China, your message in Discord may not be replied in time. You can also add the developer in WeChat, note banbot, and join the group chat.
<img style="width:180px;margin-top:10px" src="/img/wechat.jpg"/>
