* GO中一个包含go源码的文件夹即包(package)，是组织代码的最小单元；
* 包之间可以互相导入，但不能形成依赖环；
* 包的依赖关系和文件夹包含无关，所有包在依赖上都是平等的；（层级很深的文件夹对应包甚至可以作为项目入口包）
* 包的导入`import`语句必须放在文件顶部，不能在函数中导入，也不能动态导入;
* 整个go项目的所有包依赖关系应形成一个单向无环树。

## Go包依赖关系
banbot按功能特性和依赖关系划分了若干不同的包，而常用的一些全局变量大多分散在多个包，下面是全部包的依赖关系：
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


## 各个Go包中的重要全局变量
```text
core
    Ctx  // 全局上下文，可select <- core.Ctx响应全局退出事件
    StopAll // 发出全局退出事件
    NoEnterUntil  // 在给定截止时间戳之前禁止开单
    
biz
    AccOdMgrs // 订单簿对象，必定不为空
    AccLiveOdMgrs // 实盘订单簿对象，实盘时不为空
    AccWallets // 钱包
    
data
    Spider // 爬虫

orm
    HistODs // 已平仓的订单：全部出场，仅回测使用
    AccOpenODs // 打开的订单：尚未提交、已提交未入场、部分入场，全部入场，部分出场
    AccTriggerODs // 尚未提交的限价入场单，等待轮询提交到交易所，仅实盘使用
    AccTaskIDs // 当前任务ID
    AccTasks // 当前任务

exg
    Default  // 交易所对象

strat
    StagyMap // 策略注册map
    Versions // 策略版本
    Envs // 涉及的所有K线环境：Pair+TimeFrame
    PairTFStags // 标的+TF+策略 pair:[stratID]TradeStrat
    AccJobs // 涉及的所有标的 account: pair_tf: [stratID]StratJob
    AccInfoJobs // 涉及的所有辅助信息标的 account: pair_tf: [stratID]StratJob
    ForbidJobs // 禁止创建的策略任务 pair_TF: stratID: empty
```
注意：所有Acc开头的变量都是支持多账户的map
