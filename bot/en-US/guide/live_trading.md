banbot allows you to perform real-time simulated trading or live trading without modifying your strategies. This document helps you deploy a trading bot to a production environment.

::: warning Risk Warning
Banbot currently does not have a large number of live trading users. Although common live trading use cases have passed testing, there is still a possibility that undiscovered bugs may cause financial losses. Use of this software is at your own risk. The author and all related parties assume no responsibility for your trading results.

If you are planning to start live trading, please ensure that your strategy or yml configuration includes appropriate stop-loss settings to avoid significant losses, and test with a small amount of capital for a period of time first.
:::

::: tip Technical Support
We offer preferential live trading servers to help you set up a live trading environment, and provide live trading technical support and account management services. [Go to Purchase](https://banbot.site/zh-CN/services)
:::

## 1. Compilation
**Compiling from WebUI**  
You can execute `bot` to start the WebUI directly, then navigate to [/en-US/setting/](http://127.0.0.1:8000/en-US/setting/). On the left side, select 【Compile Code】, and on the right side, choose the target system and architecture. Proceed with the compilation and download.

**Compiling from Terminal**  
Possible values for `GOOS`: linux, darwin, windows, ...  
Possible values for `GOARCH`: amd64, arm64, ...

::: code-group
```shell [Linux]
export GOARCH="amd64"
export GOOS="linux"
go build -o bot
```

```shell [MacOS]
export GOARCH="amd64"
export GOOS="darwin"
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

## 2. Preparing the Database
Install and start TimeScaledb. It is recommended to use Docker for a quick setup. Refer to the [documentation](https://docs.timescale.com/self-hosted/latest/install/).

Save your database connection string: `postgresql://postgres:123@[timescaledb]:5432/ban` (You may need to modify the password or database name, etc.)

::: tip Note
You do not need to create the database or related table structures. banbot will automatically initialize the database and related table structures upon startup.
:::

## 3. Editing Configuration
Upload the compiled executable file to the `/ban` directory on the target server. Create a directory `/ban/data` as the data directory and set the environment variable `BanDataDir=/ban/data`.

Then execute `/ban/bot init` to generate a YML configuration file in `/ban/data`.

Next, edit the `/ban/data/config.local.yml` file to set the database connection string, exchange keys, single transaction amount, trading strategy, and cycle, etc.

You can configure multiple strategies and accounts. If you need to run multiple strategies on different accounts, you can create multiple YML configuration files and start multiple bot processes accordingly.

For detailed configuration, refer to the [Configuration File](./configuration.md).

::: tip Note
`config.local.yml` takes precedence over `config.yml`. You can modify your configuration in either of these files. There is no need to specify these configuration file paths during startup; they will be automatically read.
:::

## 4. Starting the Trading Bot
You need to start both the spider process and the bot process. The spider process is used to subscribe to and update public data such as candlestick charts and order books, saving them to the database.
The bot process subscribes to candlestick data and other information from the spider process and executes trading strategies. You can start multiple bot processes to run different strategies.

Strategies and trading accounts consume minimal resources. On a 2-core, 2GB VPS, you can start dozens of bot processes, each configured with hundreds of strategies and trading accounts.

**Starting the Spider**  
Execute `bot spider` to start the spider process immediately. It is recommended to start it in the background and dump the logs:
```shell
nohup /ban/bot spider > /tmp/spider.log 2>&1 &
```
**Starting the Trading Bot**  
Execute `bot trade` to start the real-time trading bot. It is recommended to start it in the background and dump the logs:
```shell
nohup /ban/bot trade -config @demo.yml > /tmp/trade.log 2>&1 &
```
::: tip Tip
The logs for the spider process will be automatically saved to `@logs/spider.log`; the logs for the bot process will be automatically saved to `@logs/[bot_name].log`. Log files will be rotated automatically when they exceed 300MB in size.

Therefore, you can directly redirect the stdout and stderr of both the spider and the bot to `/dev/null`.
:::

## 5. Notifications, DashBoard, and Monitoring
**Notifications**  
You can configure `rpc_channels` in the YML file for notifications. Messages will be sent to your social apps (currently supporting WeCom) when the bot starts, stops, enters a position, or exits a position.

You can follow the WeCom plugin in WeChat (scan the QR code from the WeCom PC management console) to receive these messages in WeChat.

**DashBoard UI**  
You can configure `api_server` in the yml file. This will start a web service simultaneously when the bot is launched. After the bot is started, you can access the bot's DashBoard using the configured username and password to view the trading overview and manage the bot.

The web service mentioned above is started with HTTP. It is recommended that you set the `bind_ip` to the local or intranet IP of the server to prevent unauthorized access.

If you need to access the server's Dashboard from your local machine, you can connect to the server running the bot via SSH and then use port forwarding to forward requests from a local port to the server port:
```shell
ssh -L [local_port]:[server_bind_ip]:[server_port] [username]@[server_public_address]
# e.g. 
ssh -L 8001:127.0.0.1:8001 your_username@remote_server_address
```

::: tip Tip
If you need to expose the dashboard to the Internet, it is strongly recommended that you configure https through nginx and set a strong account and password.
:::

**Monitoring**  
You can use `crontab` to periodically execute the [check_bot.sh](https://github.com/banbox/banbot/blob/main/doc/check_bot.sh) script to check the bot's status and send email notifications.
```shell
# for centos 8
dnf install mailx
vi /etc/mail.rc
```
Sample configuration:
```text
set smtp=smtps://smtp.gmail.com:465
set smtp-auth=login
set smtp-auth-user=your_email@gmail.com
set from=your_email@gmail.com
set smtp-auth-password=your_email_password
set ssl-verify=ignore
```
Test the email sending function:
```shell
echo "Test email body" | mail -s "Test email subject" recipient@example.com
```
Open crontab:
```shell
crontab -e
```
Add a line:
```text
*/5 * * * * /ban/check_bot.sh trade user1@example.com user2@example.com
```
Grant execution permissions to the script:
```shell
chmod +x /ban/check_bot.sh
```