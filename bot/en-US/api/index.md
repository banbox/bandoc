* In GO, a folder containing GO source code is called a package, which is the smallest unit for organizing code;
* Packages can import each other, but they cannot form dependency cycles;
* The dependency relationship between packages is independent of folder inclusion, and all packages are equal in terms of dependencies; (A package corresponding to a deeply nested folder can even serve as the entry point of the project)
* The `import` statement for packages must be placed at the top of the file; it cannot be imported within functions, nor can it be dynamically imported;
* The dependency relationships of all packages within the entire Go project should form a directed acyclic tree.

## Go Package Dependencies
Banbot has divided several different packages according to functional features and dependency relationships, while some commonly used global variables are mostly scattered across multiple packages. Below is the dependency relationship of all packages:
#### [core](core.md)
&emsp;--
#### [btime](btime.md)
&emsp;core
#### [utils](utils.md)
&emsp;core btime
#### [config](config.md)
&emsp;core btime utils
#### [exg](exg.md)
&emsp;config utils core
#### [orm](orm.md)
&emsp;exg config  
#### [data](data.md)
&emsp;orm exg config 
#### [strat](strat.md)
&emsp;orm utils
#### [goods](goods.md)
&emsp;orm exg 
#### [biz](biz.md)
&emsp;exg orm strat goods data
#### [opt](opt.md)
&emsp;biz data orm goods strat
#### [live](live.md)
&emsp;biz data orm goods strat
#### [entry](entry.md)
&emsp;optmize live data 

## Important Global Variables in Each Go Package
```text
core
    Ctx  // Global context, can use select <- core.Ctx to respond to global exit events
    StopAll // Trigger global exit event
    NoEnterUntil  // Prohibit opening positions before the given deadline timestamp
    
biz
    AccOdMgrs // Order book objects, guaranteed non-null
    AccLiveOdMgrs // Live trading order book objects, non-null in live trading
    AccWallets // Wallets
    
data
    Spider // Web crawler

orm
    HistODs // Closed orders: fully exited, used only in backtesting
    AccOpenODs // Open orders: not submitted, submitted but not entered, partially entered, fully entered, partially exited
    AccTriggerODs // Limit entry orders not yet submitted, waiting for polling submission to exchange, used only in live trading
    AccTaskIDs // Current task IDs
    AccTasks // Current tasks

exg
    Default  // Exchange object

strat
    StagyMap // Strategy registration map
    Versions // Strategy versions
    Envs // All candlestick environments involved: Pair+TimeFrame
    PairTFStags // Symbol+TF+Strategy. pair:[stratID]TradeStrat
    AccJobs // All symbols involved. account: pair_tf: [stratID]StratJob
    AccInfoJobs // All auxiliary information symbols involved. account: pair_tf: [stratID]StratJob
    ForbidJobs // forbid policy jobs for creation. pair_TF: stratID: empty
```
Note: All variables starting with Acc are maps that support multiple accounts
