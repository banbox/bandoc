You can quickly get familiar with and use our [sample strategy project](https://github.com/banbox/banstrats). Of course, you may have your own trading strategy to test. This page helps you understand how to implement a custom strategy.

## Overview
To start a new strategy, there are only two steps.

First, implement a strategy function of `func Demo1(pol *config.RunPolicyConfig) *strat.TradeStrat`.

Second, you only need to register this strategy in the current go package's `init` function.

Let's see how to implement our custom logic in the strategy function.

::: tip
It is strongly recommended that you use AI tools such as Cursor or Claude to convert trading strategies in other languages ​​into banbot strategies. Just attach the [knowledge base](/banbot_en.txt){target="_self"}
:::

## Strategy Naming
The recommended naming format is `folder:strategy_name`. You may have many different categories of trading strategies. For easy long-term maintenance, it is recommended to put similar strategies in the same folder. The depth is not limited.

For example:
```text
root
 |-org
 |  |-ma
 |  |  |-demo.go
 |  |  |-trend.go
 | grid
 |  |-inv.go
 |-main.go
```
Above there are two valid strategy groups `ma` and `grid`. You can also continue to create subfolders in `ma` to manage strategies. Note that all strategy groups need to be registered in `main.go` in the root directory:
```go
import (
	"github.com/banbox/banbot/entry"
	_ "github.com/banbox/banstrats/org/ma"
	_ "github.com/banbox/banstrats/grid"
)
```

## RunPolicyConfig parameters

The parameter `pol` of the strategy function is an item in the `run_policy` list in the yaml configuration file.

You can get the parameters passed in from the configuration file through `atrLen := pol.Param("atrLen", 9)` so that different parameters can be used for different products.
You can also define a hyperparameter using `atrLen := pol.Def("atrLen", 9, core.PNorm(7, 20))`, which works exactly the same as `pol.Param` during backtesting, but when switching to hyperparameter tuning mode, the value of `atrLen` will be randomly generated using a normal distribution with a default value of the mean and upper and lower limits of `(7, 20)`.
You can also replace `core.PNorm` with `core.PNormF` to specify a different mean and multiplier.
Similarly, you can also use `core.PUniform` to specify a uniform linear distribution hyperparameter.

Here are several complete code examples:
```go
func Demo(pol *config.RunPolicyConfig) *strat.TradeStrat {
    atrLen := pol.Param("atrLen", 9)
    atrLen1 := pol.Def("atrLen1", 9, core.PNorm(3, 20))
    atrLen2 := pol.Def("atrLen2", 9, core.PNormF(3, 20, 12, 1))
    atrLen3 := pol.Def("atrLen3", 9, core.PUniform(3, 20))
    return &strat.TradeStrat{
		// more 
    }
}
```
::: warning Tips
Each item in the yaml configuration `run_policy` corresponds to a call to the strategy function, generating a strategy with specific parameters.
The same strategy can appear in multiple `run_poolicy` items, that is, the same strategy function may be executed multiple times.
The `*strat.TradeStrat` returned by the strategy function will be applied to multiple varieties, corresponding to multiple `*strat.StratJob`.
Therefore, any variables related to a single variety should not be saved in the strategy function, but should be saved through `*strat.StratJob.More`.
The variables in the strategy function should remain unchanged. Otherwise, it will lead to unexpected states.
:::

## strat.TradeStrat Strategy Object

`TradeStrat` provides a wealth of property configurations and callback functions. The most commonly used is `OnBar`.

The following is the complete definition of `TradeStrat`:
```go
type TradeStrat struct {
	Name          string  // The strategy name does not need to be set and will be automatically set to the name used during registration
	Version       int     
	WarmupNum     int     // candle preheating length
	MinTfScore    float64 // Minimum time cycle quality, default 0.8 最小时间周期质量，默认0.8
	WatchBook     bool    // Whether to monitor the real-time depth information of the order book
	DrawDownExit  bool    // Whether to enable retracement stop loss (i.e. trailing stop loss)
	BatchInOut    bool    // Whether to batch execute entry/exit 是否批量执行入场/出场
	BatchInfo     bool    // whether to perform batch processing after OninfoBar 是否对OnInfoBar后执行批量处理
	StakeRate     float64 // Relative basic amount billing rate 相对基础金额开单倍率
	StopEnterBars int     // If the limit order exceeds the given K line and still does not enter the market, it will be cancelled
	EachMaxLong   int      // max number of long open orders for one pair
	EachMaxShort  int      // max number of short open orders for one pair
	AllowTFs      []string // Allow running time period, use global configuration when not provided 允许运行的时间周期，不提供时使用全局配置
	Outputs       []string // The content of the text file output by the strategy, where each string is one line 策略输出的文本文件内容，每个字符串是一行
	Policy        *config.RunPolicyConfig

	OnPairInfos         func(s *StratJob) []*PairSub                        // The strategy requires additional data on other types or periods
	OnStartUp           func(s *StratJob)                                   // Callback at startup. Called before the first execution
	OnBar               func(s *StratJob)                                   // Callback function for each K line
	OnInfoBar           func(s *StratJob, e *ta.BarEnv, pair, tf string)   // Other dependent bar data 其他依赖的bar数据
	OnTrades            func(s *StratJob, trades []*banexg.Trade)          // Transaction by transaction data 逐笔交易数据
	OnBatchJobs         func(jobs []*StratJob)                             // All target jobs at the current time, used for bulk opening/closing of orders 当前时间所有标的job，用于批量开单/平仓
	OnBatchInfos        func(jobs map[string]*StratJob)                    // All info marked jobs at the current time, used for batch processing 当前时间所有info标的job，用于批量处理
	OnCheckExit         func(s *StratJob, od *ormo.InOutOrder) *ExitReq     // Custom order exit logic 自定义订单退出逻辑
	OnOrderChange       func(s *StratJob, od *ormo.InOutOrder, chgType int) // Order update callback 订单更新回调
	GetDrawDownExitRate CalcDDExitRate                                     // Calculate the ratio of tracking profit taking, drawdown, and exit 计算跟踪止盈回撤退出的比率
	PickTimeFrame       PickTimeFrameFunc                                  // Choose a suitable trading cycle for the specified currency 为指定币选择适合的交易周期
	OnShutDown          func(s *StratJob)                                  // Callback when the robot stops 机器人停止时回调
}
```

## Simple policy example
```go
package ma

import (
	"github.com/banbox/banbot/config"
	"github.com/banbox/banbot/core"
	"github.com/banbox/banbot/strat"
	ta "github.com/banbox/banta"
)

func init() {
	// Register the policy in Banbot, and use ma: demo in the configuration file to reference this policy later
	// `init`The function is a special function in Go that will be executed immediately when the current package is imported
	strat.AddStratGroup("ma", map[string]strat.FuncMakeStrat{
		"demo": Demo,
	})
}

func Demo(pol *config.RunPolicyConfig) *strat.TradeStrat {
	smlLen := int(pol.Def("smlLen", 5, core.PNorm(3, 10)))
	bigLen := int(pol.Def("bigLen", 20, core.PNorm(10, 40)))
	return &strat.TradeStrat{
		WarmupNum: 100,
		OnBar: func(s *strat.StratJob) {
			e := s.Env
			ma5 := ta.SMA(e.Close, smlLen)
			ma20 := ta.SMA(e.Close, bigLen)
			maCrx := ta.Cross(ma5, ma20)

			if maCrx == 1 {
				s.OpenOrder(&strat.EnterReq{Tag: "open"})
			} else if maCrx == -1 {
				s.CloseOrders(&strat.ExitReq{Tag: "exit"})
			}
		},
	}
}
```
## banta.BarEnv and banta.Series

`banta.BarEnv` is the operating environment of a technical indicator, which stores information such as the current exchange, market, product, time period, etc.
A strategy task will require at least one `banta.BarEnv`. If other products or time periods are subscribed through `OnPairInfos`, multiple operating environments will be required.
But it should be noted that only one operating environment `BarEnv` will be created for each exchange, each market, each product, and each time period.

`banta.BarEnv` has several built-in original `Series`, namely: `Open`, `High`, `Low`, `Close`, `Volume`, which respectively save the sequence information of opening price, highest price, lowest price, closing price, and trading volume.

`Series` is a special structure in `banta` for storing serialized data. All technical indicator functions in `banta` receive one or more `Series`, and return a `Series` after calculation.

You can use `Series.Get(0)` to get the latest value of a series, such as `e.Close.Get(0)` to get the latest closing price;
You can also use `Series.Range(0,5)` to get the 5 most recent values ​​of a series, which returns a `[]float64` array of length 5.

When performing multiple repeated calculations at the same bar time (such as running the same batch of strategies on multiple accounts in real trading), `Series` will automatically use cached results to avoid repeated calculations.

For the Bollinger Bands indicator `banta.BBANDS` that returns the three parts of `upper/mid/lower`, the only `Series` it returns is an aggregate, and the value cannot be obtained through `Get(i)`.
Instead, it should be extracted into 3 series objects in the following way:
```go
bbolCols := ta.BBANDS(e.Close, 10, 2, 2).Cols
upper, mid, lower := bbolCols[0], bbolCols[1], bbolCols[2]
```
Then you can execute `Get(i)` for `upper/mid/lower` to get the value.
::: tip Indicator operation tips
`banta` is an event-driven technical indicator library. The `OnBar` function will be executed once for each candle, which means that each time the technical indicator is called, only the latest value will be updated to `Series`.
Instead of vectorized calculation like `ta-lib`, all historical series are calculated at once.

`Series` saves the latest status of each indicator calculation. When a new candle is received, it will be quickly calculated from the last calculation status without repeating all the data of the series.

For example, `banta.EMA` requires the previous moving average value when calculating, and the `ta-lib` vector indicator library needs to calculate from scratch given the entire column of historical data, while `banta` will only calculate once from the last cached value.
:::
## Custom indicators

You can implement your custom indicator logic quickly and easily, taking `Highest` as an example:
```go:line-numbers {1}
func Highest(obj *Series, period int) *Series {
	res := obj.To("_hh", period)
	if res.Cached() {
		return res
	}
	if obj.Len() < period {
		return res.Append(math.NaN())
	}
	resVal := slices.Max(obj.Range(0, period))
	return res.Append(resVal)
}
```
The above is a simple technical indicator of the highest value in a specified period. The first 4 lines of all technical indicators are almost similar. A `Series` object is derived from `obj` to save the results.
The `_hh` and `period` parameters are used as hashes here.

In fact, `Series` has a member attribute:
```go
Subs  map[string]map[int]*Series
```
It saves all `Series` derived from this `Series`. In essence, all `Series` in the strategy are derived from the original `Open/High/Low/Close/Volume`.

Since the indicator function only updates one value each time it is called, when the length of lines 6-8 is insufficient, nan is directly returned. Line 9 is the key to this indicator, which calculates the maximum value of the most recent n series and returns it.

## More complex custom indicators

Your custom indicator may sometimes need to cache more intermediate state information. In this case, you can customize the structure and save it in `Series.More`.
```go:line-numbers {1}
type sumState struct {
	sumVal float64
	addLen int
}

func Sum(obj *Series, period int) *Series {
	res := obj.To("_sum", period)
	if res.Cached() {
		return res
	}
	sta, _ := res.More.(*sumState)
	if sta == nil {
		sta = &sumState{}
		res.More = sta
	}
	curVal := obj.Get(0)
	if math.IsNaN(curVal) {
		// 输入值无效，重置，重新开始累计
		curVal = 0
		sta.sumVal = 0
		sta.addLen = 0
	} else {
		if sta.addLen < period {
			sta.sumVal += curVal
			sta.addLen += 1
		} else {
			oldVal := obj.Get(period)
			if math.IsNaN(oldVal) {
				sta.sumVal = 0
				sta.addLen = 0
			} else {
				sta.sumVal += curVal - oldVal
			}
		}
	}
	if sta.addLen < period {
		return res.Append(math.NaN())
	}
	return res.Append(sta.sumVal)
}
```
The above is an indicator that calculates the sum of the sequences of the most recent n periods. Lines 11 to 39 can actually be replaced by the following line, but the above approach of caching the last calculation result is significantly more efficient than the following two loops.
```go
    // gonum.org/v1/gonum/floats
    return res.Append(floats.Sum(obj.Range(0, period)))
```
## Strategy Warmup

Most indicators have an unstable startup period during which they are either unavailable (NaN) or calculated incorrectly. This can cause inconsistencies because the banbot does not know how long this unstable period should be.
To solve this problem, the `WarmupNum` property can be set for the strategy. This should be set to the maximum number of candlesticks required for the strategy to calculate a stable indicator.

For additional symbols or periods that `OnPairInfos` subscribes to, you can specify them in its return value:
```go
    OnPairInfos: func(s *strat.StratJob) []*strat.PairSub {
        return []*strat.PairSub{
            {"_cur_", "1h", 30},
        }
    },
```
The above additional subscription is for the `1h` period candle of the current product, and the preheating quantity is 30.

## Save intermediate state

Sometimes you may need to save some intermediate states for the next calculation; or you may need to synchronize some information between different callback functions.
```go
package ma

import (
	"github.com/banbox/banbot/config"
	"github.com/banbox/banbot/core"
	"github.com/banbox/banbot/strat"
	ta "github.com/banbox/banta"
)

type Demo2Sta struct {
	bigDirt int
}

func Demo2(pol *config.RunPolicyConfig) *strat.TradeStrat {
	smlLen := int(pol.Def("smlLen", 5, core.PNorm(3, 10)))
	bigLen := int(pol.Def("bigLen", 20, core.PNorm(10, 40)))
	return &strat.TradeStrat{
		WarmupNum: 100,
		OnPairInfos: func(s *strat.StratJob) []*strat.PairSub {
			return []*strat.PairSub{
				{"_cur_", "1h", 30},
			}
		},
		OnStartUp: func(s *strat.StratJob) {
			s.More = &Demo2Sta{}
		},
		OnBar: func(s *strat.StratJob) {
			e := s.Env
			m, _ := s.More.(*Demo2Sta)
			ma5 := ta.SMA(e.Close, smlLen)
			ma20 := ta.SMA(e.Close, bigLen)
			maCrx := ta.Cross(ma5, ma20)

			if maCrx == 1 && m.bigDirt > 0 {
				s.OpenOrder(&strat.EnterReq{Tag: "open"})
			} else if maCrx == -1 {
				s.CloseOrders(&strat.ExitReq{Tag: "exit"})
			}
		},
		OnInfoBar: func(s *strat.StratJob, e *ta.BarEnv, pair, tf string) {
			m, _ := s.More.(*Demo2Sta)
			ma5 := ta.SMA(e.Close, smlLen)
			ma20 := ta.SMA(e.Close, bigLen)
			m.bigDirt = ta.Cross(ma5, ma20)
		},
	}
}
```
As shown above, this is a moving average crossover strategy combining large and small periods. When the short moving average of the large period is above the long moving average and the short moving average of the small period crosses the long moving average, the market will be entered.

First, initialize `StratJob.More` in `OnStartUp`.
Then perform type conversion in `OnBar` and `OnInfoBar` and assign it to the `m` variable:
```go
m, _ := s.More.(*Demo2Sta)
```

## Issue an entry signal

To issue an entry signal, you only need to call the `StratJob.OpenOrder` method and pass a `*strat.EnterReq` parameter.

The simplest case is to only assign a value to the `Tag` property of `EnterReq`, and use the default parameters for all others. That is, open a long order according to the default order amount and leverage multiple. There is no stop profit or stop loss.

The following are all the parameters of `EnterReq`:
```go
type EnterReq struct {
	Tag             string  // Entry signal 入场信号
	StgyName        string  // Strategy Name 策略名称
	Short           bool    // Whether to short sell or not 是否做空
	OrderType       int     // 订单类型, core.OrderType*
	Limit           float64 // The entry price of a limit order will be submitted as a limit order when specified 限价单入场价格，指定时订单将作为限价单提交
	CostRate        float64 // The opening ratio is set to 1 times by default according to the configuration. Used for calculating LegalList 开仓倍率、默认按配置1倍。用于计算LegalCost
	LegalCost       float64 // Spend the amount in fiat currency. Ignore CostRate when specified 花费法币金额。指定时忽略CostRate
	Leverage        float64 // Leverage ratio 杠杆倍数
	Amount          float64 // The number of admission targets is calculated by LegalList and price 入场标的数量，由LegalCost和price计算
	StopLossVal     float64 // The distance from the entry price to the stop loss price is used to calculate StopLoss 入场价格到止损价格的距离，用于计算StopLoss
	StopLoss        float64 // Stop loss trigger price, submit a stop loss order on the exchange when it is not empty 止损触发价格，不为空时在交易所提交一个止损单
	StopLossLimit   float64 // Stop loss limit price, does not provide the use of StopLoss 止损限制价格，不提供使用StopLoss
	StopLossRate    float64 // Stop loss exit ratio, 0 means all exits, needs to be between (0,1) 止损退出比例，0表示全部退出，需介于(0,1]之间
	StopLossTag     string  // Reason for Stop Loss 止损原因
	TakeProfitVal   float64 // The distance from the entry price to the take profit price is used to calculate TakeProfit 入场价格到止盈价格的距离，用于计算TakeProfit
	TakeProfit      float64 // When the take profit trigger price is not empty, submit a take profit order on the exchange. 止盈触发价格，不为空时在交易所提交一个止盈单。
	TakeProfitLimit float64 // Profit taking limit price, TakeProfit is not available for use 止盈限制价格，不提供使用TakeProfit
	TakeProfitRate  float64 // Take profit exit ratio, 0 indicates full exit, needs to be between (0,1) 止盈退出比率，0表示全部退出，需介于(0,1]之间
	TakeProfitTag   string  // Reason for profit taking 止盈原因
	StopBars        int     // If the entry limit order exceeds how many bars and is not executed, it will be cancelled 入场限价单超过多少个bar未成交则取消
}
```
## Send an exit signal

To send an exit signal, just call the `StratJob.CloseOrders` method and pass a `*strat.ExitReq` parameter.

The simplest case is to only assign a value to the `Tag` property of `ExitReq` and use the default parameters for all other parameters. That is, close all orders with market orders, including long orders and short orders.

The following are all the parameters of `ExitReq`:
```go
type ExitReq struct {
	Tag        string  // Exit signal 退出信号
	StgyName   string  // Strategy Name 策略名称
	EnterTag   string  // Only exit orders with EnterTag as the entry signal 只退出入场信号为EnterTag的订单
	Dirt       int     // core.OdDirt* long/short/both
	OrderType  int     // 订单类型, core.OrderType*
	Limit      float64 // Limit order exit price, the order will be submitted as a limit order when specified 限价单退出价格，指定时订单将作为限价单提交
	ExitRate   float64 // Exit rate, default is 100%, which means all orders are exited 退出比率，默认100%即所有订单全部退出
	Amount     float64 // The number of targets to be exited. ExitRate is invalid when specified 要退出的标的数量。指定时ExitRate无效
	OrderID    int64   // Only exit specified orders 只退出指定订单
	UnOpenOnly bool    // When True, only exit orders that have not yet entered the venue True时只退出尚未入场的订单
	FilledOnly bool    // Only exit orders that have already entered when True True时只退出已入场的订单
	Force      bool    // Whether to force exit 是否强制退出
}
```
## Stop Loss and Take Profit

In addition to setting the stop loss and take profit of an order when entering the market, you can also directly set the stop loss and take profit of a certain order at any time:
```go
if len(s.LongOrders) > 0 {
    od := s.LongOrders[0]
    ma5Val := ma5.Get(0)
    od.SetStopLoss(&ormo.ExitTrigger{Price: ma5Val * 0.97})
    od.SetTakeProfit(&ormo.ExitTrigger{Price: ma5Val * 1.03})
}
```
You can also set stop loss and take profit for all orders:
```go
ma5Val := ma5.Get(0)
s.SetAllStopLoss(core.OdDirtLong, &ormo.ExitTrigger{
    Price: ma5Val * 0.97,
    Limit: ma5Val * 0.975,
    Rate:  0.5,
    Tag:   "stop half",
})
```
For all open long orders, a stop loss of 50% of the position is set. When the price triggers 0.97 times the 5-period moving average, half of the position is closed with a limit order stop loss of 0.975 times.

## Batch task processing
Sometimes you may need to perform some calculations (such as correlation coefficients) for all products of the current strategy together, get some intermediate states to save, or open or close orders together.
In this case, you can use the `OnBatchJobs` or `OnBatchInfos` callback function.
```go
func calcCorrs(jobs []*strat.StratJob, isBig bool) {
	// Calculate the average correlation coefficient between each variety and other varieties, and save it to More
	dataArr := make([][]float64, 0, len(jobs))
	for _, j := range jobs {
		dataArr = append(dataArr, j.Env.Close.Range(0, 70))
	}
	_, arr, err := utils.CalcCorrMat(dataArr, true)
	if err != nil {
		log.Error("calc corr mat fail", zap.Error(err))
		return
	}
	for i, j := range jobs {
		m, _ := j.More.(*BatchSta)
		if isBig {
			m.bigCorr = arr[i]
		} else {
			m.smlCorr = arr[i]
		}
	}
}

type BatchSta struct {
	smlCorr float64
	bigCorr float64
}

func BatchDemo(pol *config.RunPolicyConfig) *strat.TradeStrat {
	return &strat.TradeStrat{
		WarmupNum:  100,
		BatchInOut: true,
		BatchInfo:  true,
		OnPairInfos: func(s *strat.StratJob) []*strat.PairSub {
			return []*strat.PairSub{
				{"_cur_", "1h", 100},
			}
		},
		OnStartUp: func(s *strat.StratJob) {
			s.More = &BatchSta{}
		},
		OnBar: func(s *strat.StratJob) {
			m, _ := s.More.(*BatchSta)
			if m.bigCorr < 0.5 && m.smlCorr < 0.5 {
				// When the correlation between the large and small cycles is less than 50%, the order will be opened.
				s.OpenOrder(&strat.EnterReq{Tag: "open"})
			} else if m.smlCorr > 0.9 {
				// The current small cycle correlation of the variety is higher than 90%, close the position
				s.CloseOrders(&strat.ExitReq{Tag: "close"})
			}
		},
		OnBatchJobs: func(jobs []*strat.StratJob) {
			if jobs[0].IsWarmUp {
				return
			}
			calcCorrs(jobs, false)
		},
		OnBatchInfos: func(jobs map[string]*strat.StratJob) {
			jobList := utils.ValsOfMap(jobs)
			if jobList[0].IsWarmUp {
				return
			}
			calcCorrs(jobList, true)
		},
	}
}
```
## Custom exit logic
You can perform custom exit logic checks on each candlestick, for each open order:
```go
func CustomExitDemo(pol *config.RunPolicyConfig) *strat.TradeStrat {
	return &strat.TradeStrat{
		OnBar: func(s *strat.StratJob) {
			if len(s.LongOrders) == 0 {
				s.OpenOrder(&strat.EnterReq{Tag: "long"})
			} else if rand.Float64() < 0.1 {
				s.CloseOrders(&strat.ExitReq{Tag: "close"})
			}
		},
		OnCheckExit: func(s *strat.StratJob, od *ormo.InOutOrder) *strat.ExitReq {
			if od.ProfitRate > 0.1 {
				// Exit if profit exceeds 10%
				return &strat.ExitReq{Tag: "profit"}
			}
			return nil
		},
	}
}
```

## Stop loss by retracement (trailing stop loss)
You can easily implement stop loss by retracement through `DrawDownExit` and `GetDrawDownExitRate`.
For example, when the best historical profit of an order exceeds 10%, the order will be exited when the retracement exceeds 50%:
```go
func DrawDown(pol *config.RunPolicyConfig) *strat.TradeStrat {
	return &strat.TradeStrat{
		DrawDownExit: true,
		OnBar: func(s *strat.StratJob) {
			if len(s.LongOrders) == 0 {
				s.OpenOrder(&strat.EnterReq{Tag: "long"})
			}
		},
		GetDrawDownExitRate: func(s *strat.StratJob, od *ormo.InOutOrder, maxChg float64) float64 {
			if maxChg > 0.1 {
				// After the best profit of the order exceeds 10%, withdraw 50% and exit
				return 0.5
			}
			return 0
		},
	}
}