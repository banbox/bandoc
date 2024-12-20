编写好策略后，您可以在项目根目录下，运行以下命令启动机器人：
```shell
go run .
```
您也可以将整个项目打包为单个可执行文件：
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
运行后默认将显示一些子命令帮助列表：
```text
banbot 0.1.5
please run with a subcommand:
        trade:      live trade
        backtest:   backtest with strategies and data
        spider:     start the spider
        optimize:   run hyper parameters optimization
        bt_opt:     rolling backtest with hyperparameter optimization
        kline:      run kline commands
        tick:       run tick commands
        tool:       run tools
        web:        run web dashboard
```
## 通用命令参数
**数据目录(-datadir)**

您通过命令行启动时，除非设置了环境变量`BanDataDir`，否则每次启动时，都务必传入参数`-datadir`指定数据目录。

**默认配置文件**

在读取您传入的额外的配置文件前，banbot会从数据目录下，尝试读取两个默认配置文件：`config.yml`和`config.local.yml`。
如果这两个里面已经覆盖了您本次所需的参数，则不需要再通过`-config`额外传入配置文件路径。

**命令帮助信息**

您可以通过在命令后面添加`-help`或`-h`参数，显示帮助信息。

## 启动爬虫进程
```shell
banbot.o spider [-datadir PATH] [-c PATH] [-c PATH]
```
当您要启动实时交易时，需要先启动爬虫进程。爬虫进程默认监听`6789`端口，只接受本地的请求。您可以将yml配置`spider_addr`改为`0.0.0.0:6789`，以便接受来自外部的监听请求。

爬虫进程启动后，默认不监听任何交易所、市场、品种。它会根据收到的客户端请求，自动连接到指定交易所，市场，并监听需要的信息。
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
## 启动实时交易(模拟交易/实盘)
```shell
banbot.o trade [-spider] [-pairs PAIRS] ...
```
当您在yml配置文件指定`env`为`dry_run`时，订单不会提交到交易所，而是在本地模拟撮合。

当`env`设置为`prod`或`test`时，会分别提交到交易所的生产环境或者测试网络（部分交易所不支持测试网络）。

您可以在yml配置`spider_addr`，机器人启动时会自动尝试连接爬虫，并订阅当前交易所、市场和相关品种数据。
您也可以添加`-spider`参数，启动机器人时自动在本进程中启动爬虫。
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
## 回测
```shell
banbot.o backtest [-nodb] [-separate] ...
```
这将按yml配置中的`run_policy`启动回测，由于回测可能生产大量订单，建议您启用`-nodb`选项，不将订单记录到数据库，而是只保存到csv文件。

默认回测是将`run_policy`配置的多个策略组同时运行，得到一个组合的回测报表。如果您希望单独测试`run_policy`中每一个策略组，请启用`-separate`选项。

回测时，如果相关品种的K线不存在，则会自动下载保存到数据库。

回测结束后，回测结果将默认保存在`[数据目录]/backtest/task_[TASKID]`下，如果您指定`-nodb`，则`[TASKID]`是-1，即保存到`task_-1`目录下
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

## K线相关工具
**banbot.o kline down**  
从交易所下载K线保存到数据库

**banbot.o kline load**  
从csv/zip文件中导入K线到数据库

**banbot.o kline export**  
从数据库导出K线到csv文件

**banbot.o kline purge**  
从数据库中清空K线。

**banbot.o kline correct**  
检查数据库K线是否有错误并自动纠正。

**banbot.o kline adj_calc**  
重新计算复权因子（用于中国期货市场）

**banbot.o kline adj_export**  
导出复权因子到csv文件.
```text
banbot kline:
        down:       download kline data from exchange
        load:       load kline data from zip/csv files
        export:     export kline to csv files from db
        purge:      purge/delete kline data with args
        correct:    sync klines between timeframes
        adj_calc:   recalculate adjust factors
        adj_export: export adjust factors to csv
```
## Tick相关工具
**banbot.o tick convert**  
对中国期货市场的csv格式tick进行转换，然后输出csv格式文件。

**banbot.o tick to_kline**  
对中国期货市场的tick文件聚合为1m周期的K线csv格式文件。

```text
banbot tick:
        convert:        convert tick data format
        to_kline:       build kline from ticks
```

## 其他工具
**banbot.o tool collect_opt**  
收集超参数调优结果，并按顺序显示到控制台。

**banbot.o tool bt_opt**  
按时间滚动进行超参数调优，然后回测。比如对于最近3年的数据。每1年的数据用于超参数调优，然后用调优后的参数自动回测接下来的3个月；然后推迟3个月重复进行调优；如此反复，模拟真实场景下回测结果。

**banbot.o tool load_cal**  
加载交易日历（针对中国期货市场）

**banbot.o tool cmp_orders**  
将从币安导出的订单与本地回测订单记录进行对比，检查回测和实盘是否一致。

**banbot.o tool data_server**  
启动一个grpc服务器，供其他语言端访问数据和指标结果等。可用于AI机器学习等。

**banbot.o tool calc_perfs**  
传入一个csv/xlsx文件，每行表示一天，每列表示一个品种的累计收益。为每列计算Shape/Sortino

**banbot.o tool corr**  
为yaml筛选后的一组品种计算相关系数，可以每隔一段时间输出一个相关矩阵图片，也可以输出平均相关系数csv文件。
```text
banbot tool:
        collect_opt:    collect result of optimize, and print in order
        load_cal:       load calenders
        cmp_orders:     compare backTest orders with exchange orders
        data_server:    serve a grpc server as data feeder
        calc_perfs:     calculate sharpe/sortino ratio for input data
        corr:           calculate correlation matrix for symbols
```