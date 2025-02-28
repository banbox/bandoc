banbot支持您无需修改策略直接进行实时模拟交易或实盘交易。本文档帮助您部署交易机器人到生产环境。

## 1. 编译
**从WebUI编译**  
您可执行`bot`直接启动WebUI，然后打开[/zh-CN/setting/](http://127.0.0.1:8000/zh-CN/setting/)，左侧选择【编译代码】，右侧选择目标系统和架构，执行编译并下载即可。

**从终端编译**  
`GOOS`的可选值：linux, darwin, windows, ...  
`GOARCH`的可选值：amd64, arm64, ...

::: code-group
```shell [Linux/MacOS]
export GOARCH="amd64"
export GOOS="linux"
go build -o bot
```

```shell [Windows Power Shell]
# build for windows
$env:GOARCH="amd64"
$env:GOOS="windows"
go build -o bot.exe

# build for linux
$env:GOARCH="amd64"
$env:GOOS="linux"
go build -o bot
```

```shell [Windows CMD]
# build for windows
set GOARCH=amd64
set GOOS=windows
go build -o bot.exe

# build for linux
set GOARCH=amd64
set GOOS=linux
go build -o bot
```
:::

## 2. 准备数据库
安装并启动TimeScaledb，建议使用docker快速启动，[文档](https://docs.timescale.com/self-hosted/latest/install/)

保存您的数据库连接字符串：`postgresql://postgres:123@[host.docker.internal]:5432/ban`（您可能需要修改其中的密码或数据库名称等）

::: tip 提示
您无需创建数据库和相关表结构，banbot启动时会自动初始化数据库和相关表结构
:::

## 3. 编辑配置
上传编译好的单个可执行文件到目标服务器的`/ban`目录下，创建目录`/ban/data`作为数据目录，设置环境变量`BanDataDir=/ban/data`。

然后执行`/ban/bot init`即可生成yml配置文件到`/ban/data`。

然后编辑`/ban/data/config.local.yml`文件，设置数据库连接字符串、交易所密钥、单笔金额、交易策略和周期等。

您可以配置多组策略和多个账户，如果您需要运行多组策略到不同账户，您可创建多个yml配置文件，分别启动多个机器人进程。

详细配置您可参考[配置文件](./configuration.md)

::: tip 提示
config.local.yml的优先级高于config.yml，您可在这两个配置文件中任意修改您的配置。启动时无需指定这两个配置文件路径，会自动读取。
:::

## 4. 启动交易机器人
您需要启动爬虫进程和机器人进程。爬虫进程用于订阅更新K线、订单簿等公开数据并保存到数据库。
机器人进程从爬虫进程订阅K线等数据，并执行交易策略。您可启动多个机器人进程以便运行不同策略。

策略和交易账户只消耗很小的资源，对2核2G的VPS，您可启动几十个机器人进程，每个机器人可配置上百个策略和上百个交易账户。

**启动爬虫**  
执行`bot spider`即可立即启动爬虫进程，推荐后台启动并转储日志：
```shell
nohup /ban/bot spider > /tmp/spider.log 2>&1 &
```
**启动交易机器人**  
执行`bot trade`即可启动实时交易机器人，推荐后台启动并转储日志：
```shell
nohup /ban/bot trade -config @demo.yml > /tmp/trade.log 2>&1 &
```
::: tip Tip
spider进程日志会自动保存到`@logs/spider.log`；机器人进程日志会自动保存到`@logs/[bot_name].log`；日志文件大小超过300M会自动轮换。

故您可以直接将spider和机器人的stdout,stderr输出重定向到`/dev/null`
:::

## 5. 消息通知、DashBoard和监控
**消息通知**  
您可在yml中配置`rpc_channels`消息通知，当机器人启动、停止、入场、平仓时发送消息到您的社交APP（目前支持企业微信）。

您微信中关注企业微信插件（登录企业微信PC管理后台查看二维码），即可从微信收到上面消息。

**DashBoard**  
您可在yml中配置`api_server`，这将会在启动机器人时同时启动一个web服务，然后您可在机器人启动后通过配置的账号密码访问机器人的DashBoard，查看交易概况并管理机器人。

上面的web服务是以http启动的，建议您将`bind_ip`设为本地或局域网ip，以避免未授权的访问。

如果您需要从其他主机访问Dashboard，您可通过ssh连接到运行机器人的服务器，然后通过端口转发映射web服务端口到其他主机：
```shell
ssh -L [本地端口]:[远程主机]:[远程端口] [用户名]@[远程服务器地址]
# e.g. 
ssh -L 8001:127.0.0.1:8001 your_username@remote_server_address
```

::: tip Tip 
如果您需要将dashboard暴露到互联网，强烈建议您通过nginx等配置https，并设置一个较强的账号和密码。
:::

**监控存活**  
您可使用`crontab`定期执行[check_bot.sh](https://github.com/banbox/banbot/blob/main/doc/check_bot.sh)脚本，检查机器人存活情况，发送邮件通知。
```shell
# for centos 8
dnf install mailx
vi /etc/mail.rc
```
示例配置如下：
```text
set smtp=smtps://smtp.gmail.com:465
set smtp-auth=login
set smtp-auth-user=your_email@gmail.com
set from=your_email@gmail.com
set smtp-auth-password=your_email_password
set ssl-verify=ignore
```
测试邮件发送功能：
```shell
echo "Test email body" | mail -s "Test email subject" recipient@example.com
```
打开crontab：
```shell
crontab -e
```
添加一行：
```text
*/5 * * * * /ban/check_bot.sh trade user1@example.com user2@example.com
```
赋予脚本执行权限：
```shell
chmod +x /ban/check_bot.sh
```
