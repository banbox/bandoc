本页介绍如何安装运行机器人的环境。您主要需要准备以下几个部分：
* TimeScaleDB：基于postgresql的高性能时序数据库，用于存储K线和订单等数据。
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

## 安装golang
请从golang的官网下载[安装](https://go.dev/doc/install)

您可以使用`Visual Studio Code`或`GoLand`作为开发IDE


