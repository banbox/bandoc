You can quickly configure and run banbot locally without docker by following the steps below:

## Step 1. Installation
You need to install TimeScaledb and the Golang development environment. Please refer to the [guide](./install.md).

## Step 2. Get the example strategy project and compile it
You can directly pull the example project using git: `git clone https://github.com/banbox/banstrats`  
If you don’t have the git tool installed, you can also open the [banstrats](https://github.com/banbox/banstrats) webpage, download the zip file, and extract it.

After preparing the example strategy project, navigate to the project root directory (the folder with `go.mod`), and execute the following commands in the terminal (command line):

::: code-group
```shell [Linux/MacOS]
# Initialize dependencies
go mod tidy

# Compile the strategy and banbot into a single executable file
go build -o bot
```
```shell [Windows]
# Initialize dependencies
go mod tidy

# Compile the strategy and banbot into a single executable file
go build -o bot.exe
```
:::
<img style="width:480px;margin-top:10px" src="/img/compile.jpg"/>

## Step 3. Configure environment variables
For convenience in subsequent use, you need to set the environment variables `BanDataDir` and `BanStratDir`.

`BanDataDir` is the directory where backtest results and frontend UI resource files are saved during the operation of banbot. It is recommended to set it to an empty directory.

`BanStratDir` is the path to your trading strategy project (banstrats). Each time you run a backtest, banbot will automatically save the corresponding strategy code version for that backtest, making it easy for you to revert to a previous version.

For example, set the environment variables as follows:
```text
BanDataDir=E:\quant\bandata
BanStratDir=E:\quant\banstrats
```

## Step 4. Modify the configuration file
In the strategy project, simply execute `bot.exe init` to automatically initialize the configuration files `config.yml` and `config.local.yml` in the `BanDataDir`.
<img style="width:780px;margin-top:10px" src="/img/init_config.jpg"/>

Then edit the `config.local.yml` file to set the database connection string, exchange keys, single transaction amount, trading strategy, and period, etc.

Example:
```yaml
stake_amount: 100
wallet_amounts:
  USDT: 1000
timerange: "20230701-20250101"
pairs: ['ETH/USDT']
run_policy:
  - name: ma:demo
    run_timeframes: [15m]
accounts:
  user1:
    binance:
      prod:
        api_key: vvv
        api_secret: vvv
database:
  url: postgresql://postgres:123@[127.0.0.1]:5432/ban
```

## Step 5. Start WebUI
In the strategy project, simply execute `bot.exe` to start the WebUI and automatically open the browser.

You can also visit `http://127.0.0.1:8000/en-US` to experience it.

For more usage of the command line, [please refer to](./bot_usage.md).

<img style="width:780px;margin-top:10px" src="/img/run_webui.jpg"/>