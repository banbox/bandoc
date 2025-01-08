# data Package

The data package provides functionality for data processing and management.

## Important Structures

### Feeder
Each Feeder corresponds to a trading pair and can contain multiple time dimensions.

Public fields:
- `ExSymbol *orm.ExSymbol` - Exchange trading pair information
- `States []*PairTFCache` - Cache states for each time dimension
- `WaitBar *banexg.Kline` - K-line data waiting to be processed
- `CallBack FnPairKline` - K-line data callback function
- `OnEnvEnd FuncEnvEnd` - Environment end callback function (requires position closing when futures main contract switches or stock has ex-rights)
- `isWarmUp bool` - Whether currently in warm-up state

### IKlineFeeder
K-line data feeder interface.

Public methods:
- `getSymbol() string` - Get trading pair name
- `getWaitBar() *banexg.Kline` - Get waiting K-line
- `setWaitBar(bar *banexg.Kline)` - Set waiting K-line
- `SubTfs(timeFrames []string, delOther bool) []string` - Subscribe to specified time periods
- `WarmTfs(curMS int64, tfNums map[string]int, pBar *utils.PrgBar) (int64, *errs.Error)` - Warm up time periods
- `onNewBars(barTfMSecs int64, bars []*banexg.Kline) (bool, *errs.Error)` - Process new K-line data
- `getStates() []*PairTFCache` - Get cache states

### KlineFeeder
Each Feeder corresponds to a trading pair and can contain multiple time dimensions. Used in live trading.

Public fields:
- `Feeder` - Inherits from Feeder
- `PreFire float64` - Ratio for triggering bar early
- `showLog bool` - Whether to display logs

### IHistKlineFeeder
Historical K-line data feeder interface, inherits from IKlineFeeder.

Additional public methods:
- `getNextMS() int64` - Get end timestamp of next bar
- `DownIfNeed(sess *orm.Queries, exchange banexg.BanExchange, pBar *utils.PrgBar) *errs.Error` - Download K-lines for entire range
- `SetSeek(since int64)` - Set reading position
- `GetBar() *banexg.Kline` - Get current K-line
- `RunBar(bar *banexg.Kline) *errs.Error` - Run callback function for K-line
- `CallNext()` - Move pointer to next K-line

### HistKLineFeeder
Historical data feeder, base class for file feeder and database feeder.

Public fields:
- `KlineFeeder` - Inherits from KlineFeeder
- `TimeRange *config.TimeTuple` - Time range
- `TradeTimes [][2]int64` - Trading times

### DBKlineFeeder
Database K-line feeder for backtesting.

Public fields:
- `HistKLineFeeder` - Inherits from HistKLineFeeder
- `offsetMS int64` - Offset timestamp

### IProvider
Data provider interface.

Public methods:
- `LoopMain() *errs.Error` - Main loop
- `SubWarmPairs(items map[string]map[string]int, delOther bool) *errs.Error` - Subscribe and warm up trading pairs
- `UnSubPairs(pairs ...string) *errs.Error` - Unsubscribe trading pairs
- `SetDirty()` - Set dirty flag

### Provider
Data provider base class.

Public fields:
- `holders map[string]T` - Map of held Feeders
- `newFeeder func(pair string, tfs []string) (T, *errs.Error)` - Function to create new Feeder
- `dirtyVers chan int` - Dirty version channel
- `showLog bool` - Whether to display logs

### HistProvider
Historical data provider.

Public fields:
- `Provider[IHistKlineFeeder]` - Inherits from Provider
- `pBar *utils.StagedPrg` - Progress bar

### LiveProvider
Real-time data provider.

Public fields:
- `Provider[IKlineFeeder]` - Inherits from Provider
- `*KLineWatcher` - K-line watcher

### NotifyKLines
K-line notification message.

Public fields:
- `TFSecs int` - Time period (seconds)
- `Interval int` - Update interval (seconds)
- `Arr []*banexg.Kline` - K-line array

### KLineMsg
K-line message.

Public fields:
- `ExgName string` - Exchange name
- `Market string` - Market type
- `Pair string` - Trading pair
- `TFSecs int` - Time period (seconds)
- `Interval int` - Update interval (seconds)
- `Arr []*banexg.Kline` - K-line array

### SaveKline
Task for saving K-lines.

Public fields:
- `Sid int32` - Trading pair ID
- `TimeFrame string` - Time period
- `Arr []*banexg.Kline` - K-line array
- `SkipFirst bool` - Whether to skip first
- `MsgAction string` - Message action

### FetchJob
K-line fetching task.

Public fields:
- `PairTFCache` - K-line cache
- `Pair string` - Trading pair
- `CheckSecs int` - Check interval (seconds)
- `Since int64` - Start timestamp
- `NextRun int64` - Next run timestamp

### Miner
Data miner.

Public fields:
- `ExgName string` - Exchange name
- `Market string` - Market type
- `Fetchs map[string]*FetchJob` - Map of fetch tasks
- `KlineReady bool` - Whether K-line is ready
- `KlinePairs map[string]bool` - Map of K-line trading pairs
- `TradeReady bool` - Whether trade is ready
- `TradePairs map[string]bool` - Map of trade trading pairs
- `BookReady bool` - Whether order book is ready
- `BookPairs map[string]bool` - Map of order book trading pairs
- `IsWatchPrice bool` - Whether to monitor price

### LiveSpider
Real-time data spider.

Public fields:
- `*utils.ServerIO` - Server IO
- `miners map[string]*Miner` - Map of miners

### SubKLineState
K-line subscription state.

Public fields:
- `Sid int32` - Trading pair ID
- `NextNotify float64` - Next notification time
- `PrevBar *banexg.Kline` - Previous K-line

### KLineWatcher
K-line watcher.

Public fields:
- `*utils.ClientIO` - Client IO
- `jobs map[string]*PairTFCache` - Map of jobs
- `OnKLineMsg func(msg *KLineMsg)` - Callback for receiving K-line message
- `OnTrade func(exgName, market string, trade *banexg.Trade)` - Callback for receiving trade

### WatchJob
Watch task.

Public fields:
- `Symbol string` - Trading pair
- `TimeFrame string` - Time period
- `Since int64` - Start timestamp

## K-line Data Related

### NewKlineFeeder
Create a new K-line data feeder for handling real-time K-line data.

Parameters:
- `exs *orm.ExSymbol` - Exchange trading pair information
- `callBack FnPairKline` - K-line data callback function
- `showLog bool` - Whether to display logs

Returns:
- `*KlineFeeder` - K-line feeder instance
- `*errs.Error` - Error information

### NewDBKlineFeeder
Create a new database K-line feeder for reading historical K-line data from database.

Parameters:
- `exs *orm.ExSymbol` - Exchange trading pair information
- `callBack FnPairKline` - K-line data callback function
- `showLog bool` - Whether to display logs

Returns:
- `*DBKlineFeeder` - Database K-line feeder instance
- `*errs.Error` - Error information

### NewHistProvider
Create a new historical data provider for managing historical K-line data retrieval and processing.

Parameters:
- `callBack FnPairKline` - K-line data callback function
- `envEnd FuncEnvEnd` - Environment end callback function
- `showLog bool` - Whether to display logs
- `pBar *utils.StagedPrg` - Progress bar object

Returns:
- `*HistProvider` - Historical data provider instance

### RunHistFeeders
Run historical K-line feeder collection for batch processing of historical data.

Parameters:
- `makeFeeders func() []IHistKlineFeeder` - Function to create feeder list
- `versions chan int` - Version control channel
- `pBar *utils.PrgBar` - Progress bar object

Returns:
- `*errs.Error` - Error information

### SortFeeders
Sort or insert K-line feeders.

Parameters:
- `holds []IHistKlineFeeder` - Existing feeder list
- `hold IHistKlineFeeder` - Feeder to process
- `insert bool` - Whether it's an insert operation

Returns:
- `[]IHistKlineFeeder` - Processed feeder list

### NewLiveProvider
Create a new real-time data provider for handling real-time K-line data.

Parameters:
- `callBack FnPairKline` - K-line data callback function
- `envEnd FuncEnvEnd` - Environment end callback function

Returns:
- `*LiveProvider` - Real-time data provider instance
- `*errs.Error` - Error information

## Data Tools Related

### FindPathNames
Find all files with specified suffix in the given path.

Parameters:
- `inPath string` - Input path
- `suffix string` - File suffix

Returns:
- `[]string` - List of file paths
- `*errs.Error` - Error information

### ReadZipCSVs
Read CSV files from ZIP archive.

Parameters:
- `inPath string` - ZIP file path
- `pBar *utils.PrgBar` - Progress bar object
- `handle FuncReadZipItem` - Callback function for processing each CSV file
- `arg interface{}` - Arguments passed to callback function

Returns:
- `*errs.Error` - Error information

### RunSpider
Run data spider service.

Parameters:
- `addr string` - Service listening address

Returns:
- `*errs.Error` - Error information

### NewKlineWatcher
Create a new K-line data monitor.

Parameters:
- `addr string` - Connection address

Returns:
- `*KLineWatcher` - K-line monitor instance
- `*errs.Error` - Error information

### RunFormatTick
Run Tick data formatting tool.

Parameters:
- `args *config.CmdArgs` - Command line arguments

Returns:
- `*errs.Error` - Error information

### Build1mWithTicks
Build 1-minute K-lines using Tick data.

Parameters:
- `args *config.CmdArgs` - Command line arguments

Returns:
- `*errs.Error` - Error information

### CalcFilePerfs
Calculate file performance metrics.

Parameters:
- `args *config.CmdArgs` - Command line arguments

Returns:
- `*errs.Error` - Error information 