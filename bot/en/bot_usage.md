Once you have written your strategy, you can start the bot by running the following command in the project root directory:
```shell
go run .
```
You can also package the entire project into a single executable file:
::: code-group
```shell [Windows Power Shell]
# build for windows
$env:GOARCH="amd64"
$env:GOOS="windows"
go build -o banbot.exe

# build for linux
$env:GOARCH="amd64"
$env:GOOS="linux"
go build -o banbot.o
```

```shell [Windows CMD]
# build for windows
set GOARCH=amd64
set GOOS=windows
go build -o banbot.exe

# build for linux
set GOARCH=amd64
set GOOS=linux
go build -o banbot.o
```

```shell [Linux/MacOS]
# build for linux
export GOARCH="amd64"
export GOOS="linux"
go build -o banbot.o

# build for windows
export GOARCH="amd64"
export GOOS="windows"
go build -o banbot.exe
```
:::
By default, some subcommand help lists will be displayed after running:
```text
banbot 0.1.5
please run with a subcommand:
        trade:      live trade
        backtest:   backtest with strategies and data
        spider:     start the spider
        optimize:   run hyper parameters optimization
        bt_opt:         backtest over optimize
        kline:      run kline commands
        tick:       run tick commands
        tool:       run tools
        web:        run web dashboard
```
## Common command parameters
**Data directory (-datadir)**

When you start through the command line, unless the environment variable `BanDataDir` is set, you must pass in the parameter `-datadir` to specify the data directory each time you start.

**Default configuration file**

Before reading the additional configuration files you passed in, banbot will try to read two default configuration files from the data directory: `config.yml` and `config.local.yml`.

If these two have already covered the parameters you need this time, you do not need to pass in the configuration file path through `-config`.

**Command help information**

You can display help information by adding `-help` or `-h` parameters after the command.

## Start the crawler process
```shell
banbot.o spider [-datadir PATH] [-c PATH] [-c PATH]
```
When you want to start real-time trading, you need to start the crawler process first. The crawler process listens to the `6789` port by default and only accepts local requests. You can change the yml configuration `spider_addr` to `0.0.0.0:6789` to accept external listening requests.

After the crawler process is started, it does not listen to any exchange, market, or product by default. It will automatically connect to the specified exchange, market, and listen to the required information based on the client request received.
```text
Usage of spider:
  -config value
        config path to use, Multiple -config options may be used
  -datadir string
        Path to data dir.
  -level string
        set logging level to debug (default "info")
  -logfile string
        Log to the file specified
  -max-pool-size int
        max pool size for db
  -no-compress
        disable compress for hyper table
  -no-default
        ignore default: config.yml, config.local.yml
  -nodb
        dont save orders to database
```
## Start real-time trading (simulated trading/real trading)
```shell
banbot.o trade [-spider] [-pairs PAIRS] ...
```
When you specify `env` as `dry_run` in the yml configuration file, the order will not be submitted to the exchange, but simulated matching locally.

When `env` is set to `prod` or `test`, it will be submitted to the production environment or test network of the exchange respectively (some exchanges do not support test networks).

You can configure `spider_addr` in yml, and the robot will automatically try to connect to the crawler when it starts, and subscribe to the current exchange, market and related product data.

You can also add the `-spider` parameter to automatically start the crawler in this process when starting the robot.
```text 
Usage of trade:
  -config value
        config path to use, Multiple -config options may be used
  -datadir string
        Path to data dir.
  -level string
        set logging level to debug (default "info")
  -logfile string
        Log to the file specified
  -max-pool-size int
        max pool size for db
  -no-compress
        disable compress for hyper table
  -no-default
        ignore default: config.yml, config.local.yml
  -nodb
        dont save orders to database
  -pairs string
        comma-separated pairs
  -spider
        start spider if not running
  -stake-amount stake_amount
        Override stake_amount in config
  -stg-dir value
        dir path for strategies
  -task-hash string
        hash code to use
  -task-id int
        task
```
## Backtesting
```shell
banbot.o backtest [-nodb] [-separate] ...
```
This will start the backtest according to the `run_policy` in the yml configuration. Since the backtest may generate a large number of orders, it is recommended that you enable the `-nodb` option to not record the orders in the database, but only save them in a csv file.

The default backtest is to run multiple strategy groups configured by `run_policy` at the same time to get a combined backtest report. If you want to test each strategy group in `run_policy` separately, please enable the `-separate` option.

During the backtest, if the candle of the relevant product does not exist, it will be automatically downloaded and saved to the database.

After the backtest is completed, the backtest results will be saved in `[data directory]/backtest/task_[TASKID]` by default. If you specify `-nodb`, `[TASKID]` is -1, that is, saved in the `task_-1` directory
```text
Usage of backtest:
  -config value
        config path to use, Multiple -config options may be used
  -cpu-profile
        enable cpu profile
  -datadir string
        Path to data dir.
  -level string
        set logging level to debug (default "info")
  -logfile string
        Log to the file specified
  -max-pool-size int
        max pool size for db
  -mem-profile
        enable memory profile
  -no-compress
        disable compress for hyper table
  -no-default
        ignore default: config.yml, config.local.yml
  -nodb
        dont save orders to database
  -pairs string
        comma-separated pairs
  -separate
        run policy separately for backtest
  -stake-amount stake_amount
        Override stake_amount in config
  -stg-dir value
        dir path for strategies
  -timerange string
        Specify what timerange of data to use
```

## candle related tools
**banbot.o kline down**  
Download candle from the exchange and save to the database

**banbot.o kline load**  
Import candle from csv/zip file to database

**banbot.o kline export**  
Export candle from database to csv file

**banbot.o kline purge**  
Purge candle from database.

**banbot.o kline correct**  
Check if there is any error in database candle and correct it automatically.

**banbot.o kline adj_calc**  
Recalculate the adjust factor (for the Chinese futures market)

**banbot.o kline adj_export**  
Export the adjust factor to a CSV file
```text
banbot kline:
        down:   download kline data from exchange
        load:   load kline data from zip/csv files
        export: export kline to csv files from db
        purge:  purge/delete kline data with args
        correct: sync klines between timeframes
        adj_calc: recalculate adjust factors
```
## Tick related tools
**banbot.o tick convert**  
Convert the csv format ticks of the Chinese futures market and then output a csv format file.

**banbot.o tick to_kline**  
Aggregate the tick files of the Chinese futures market into 1m period candle csv format files.

```text
banbot tick:
        convert:        convert tick data format
        to_kline:       build kline from ticks
```
## Other tools
**banbot.o tool collect_opt**  
Collect hyperparameter tuning results and display them to the console in order.

**banbot.o tool bt_opt**  
Tuning hyperparameters in time rolling, and then backtesting. For example, for the data of the last three years. Each year's data is used for hyperparameter tuning, and then the tuned parameters are automatically backtested for the next three months; then the tuning is postponed for three months and repeated; this is repeated to simulate the backtest results in real scenarios.

**banbot.o tool load_cal**  
Load trading calendar (for Chinese futures market)

**banbot.o tool cmp_orders**  
Compare the orders exported from Binance with the local backtest order records to check whether the backtest and the real market are consistent.

**banbot.o tool calc_perfs**  
Input in a CSV/XLSX file, where each row represents one day and each column represents the cumulative income of a variety. Calculate Shape/Sortino for each column

**banbot.o tool corr**  
Calculate the correlation coefficient for a group of varieties selected by YAML, a correlation matrix image can be output at regular intervals, or an average correlation coefficient CSV file can be output.
```text
banbot tool:
        collect_opt:    collect result of optimize, and print in order   
        load_cal:       load calenders
        cmp_orders:     compare backTest orders with exchange orders
        data_server:    serve a grpc server as data feeder
        calc_perfs:     calculate sharpe/sortino ratio for input data
        corr:           calculate correlation matrix for symbols
```
