本页介绍如何安装运行机器人的环境。您主要需要准备以下几个部分：
* TimeScaleDB：基于postgresql的高性能时序数据库，用于存储K线等公开数据（订单等使用sqlite存储）。
* golang：建议使用最新版本

banbot开箱即用地支持[banta](https://github.com/banbox/banta)高性能指标库，您可基于其快速开发自定义指标。

## 安装TimeScaleDB数据库
建议按照官方文档安装最新稳定版本：
* [在linux中安装](https://docs.timescale.com/self-hosted/latest/install/installation-linux/)
* [在MacOS中安装](https://docs.timescale.com/self-hosted/latest/install/installation-macos/)
* [在Windows中安装](https://docs.timescale.com/self-hosted/latest/install/installation-windows/)
* [使用Docker安装](https://docs.timescale.com/self-hosted/latest/install/installation-docker/)
::: warning Docker安装提示
执行docker run时，请添加`-v /your/data/dir:/home/postgres/pgdata/data`参数，以便将数据映射到主机目录。
:::
您无需手动创建数据库和表结构，banbot启动时会根据您在yml配置的`database.url`自动创建数据库和表结构。

banbot仅使用TimeScaledb用于存储K线或品种等公开数据，您回测或实盘时的订单等数据将通过`gob`或`sqlite`方式存储到文件。

## 安装golang
请从golang的官网下载[安装](https://go.dev/doc/install)

我们推荐使用`Cursor`作为IDE；您也可以使用`Visual Studio Code`或`GoLand`

::: tip TIP
如果您的网络环境不能直接访问golang.org，请配置[国内源](https://learnku.com/go/wikis/38122)
:::

## 下一步
安装好后您可继续参考[快速开始](./quick_local.md)中的指引，也可逐个查看更详细的文档：[初始化项目](./init_project.md)、[命令行](./bot_usage.md)
