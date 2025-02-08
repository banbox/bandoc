您可通过我们的[示例策略项目](https://github.com/banbox/banstrats)快速熟悉和使用，当然您可能有自己的交易策略需要测试，此页面帮助您理解如何实现自定义策略。

## 概述
要开始一个新策略，只需两步。

首先实现一个`func Demo1(pol *config.RunPolicyConfig) *strat.TradeStrat`的策略函数。

其次，您只需在当前go package的`init`函数中注册此策略即可。

下面我们看看在策略函数中应该如何实现我们的自定义逻辑。

::: tip
强烈推荐您使用Cursor或Claude等AI工具将其他语言的交易策略转为banbot策略，只需附加[知识库](/banbot_cn.txt){target="_self"}
:::

## 策略命名
推荐的命名格式是`文件夹:策略名称`。您可能会有很多不同类别的交易策略，为方便长期维护，建议您将类似的策略放在同一个文件夹中。深度不限。

比如：
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
上面有`ma`和`grid`两个有效的策略组，您也可以在`ma`中继续创建子文件夹管理策略。注意，所有策略组都需要在根目录的`main.go`中注册：
```go
import (
	"github.com/banbox/banbot/entry"
	_ "github.com/banbox/banstrats/org/ma"
	_ "github.com/banbox/banstrats/grid"
)
```

## RunPolicyConfig参数 

策略函数的参数`pol`是yaml配置文件中`run_policy`列表中的一项。  
您可通过`atrLen := pol.Param("atrLen", 9)`获取从配置文件传入的参数，以便针对不同品种使用不同的参数。  
您也可使用`atrLen := pol.Def("atrLen", 9, core.PNorm(7, 20))`定义一个超参数，回测时和`pol.Param`作用完全一样，但当切换到超参数调优模式时，`atrLen`的值将使用默认值为均值，上下限为`(7, 20)`的正太分布随机生成。  
您也可以将`core.PNorm`替换为`core.PNormF`，指定另外的均值和倍率。
同样，您也可以使用`core.PUniform`指定一个均匀线性分布的超参数。  

下面是几种完整的代码示例：
```go
func Demo(pol *config.RunPolicyConfig) *strat.TradeStrat {
    atrLen := pol.Param("atrLen", 9)
    atrLen1 := pol.Def("atrLen1", 9, core.PNorm(3, 20))
    atrLen2 := pol.Def("atrLen2", 9, core.PNormF(3, 20, 12, 1))
    atrLen3 := pol.Def("atrLen3", 9, core.PUniform(3, 20))
    return &strat.TradeStrat{
		// 更多内容
    }
}
```
::: warning 提示
yaml配置`run_policy`中的每一项对应一次对策略函数的调用，生成一个特定参数的策略。  
同一个策略可以在多个`run_poolicy`项中出现，即同一个策略函数可能会执行多次。  
策略函数返回的`*strat.TradeStrat`会应用到多个品种上，对应多个`*strat.StratJob`。
所以任何单个品种相关的变量都不要保存在策略函数内，而应当通过`*strat.StratJob.More`保存。  
策略函数中的变量应保持不被修改。否则会导致意外的状态。
:::

## strat.TradeStrat 策略对象

`TradeStrat`提供了丰富的属性配置和回调函数。最常用的是`OnBar`。

下面是`TradeStrat`的完整定义：
```go
type TradeStrat struct {
	Name          string // 策略名称，无需设置，会自动设置为注册时的名称
	Version       int // 策略版本号
	WarmupNum     int // K线预热的长度
	MinTfScore    float64 // 最小时间周期质量，默认0.8
	WatchBook     bool // 是否监听订单簿实时深度信息
	DrawDownExit  bool // 是否启用回撤止损（即跟踪止损）
	BatchInOut    bool    // 是否批量执行入场/出场
	BatchInfo     bool    // 是否对OnInfoBar后执行批量处理
	StakeRate     float64 // 相对基础金额开单倍率
	StopEnterBars int // 限价单如果超过给定K线仍未入场则取消
	EachMaxLong   int      // 单个品种最大同时开多数量，默认0不限制
	EachMaxShort  int      // 单个品种最大同时开空数量，默认0不限制
	AllowTFs      []string // 允许运行的时间周期，不提供时使用全局配置
	Outputs       []string // 策略输出的文本文件内容，每个字符串是一行
	Policy        *config.RunPolicyConfig // 运行时配置

	OnPairInfos         func(s *StratJob) []*PairSub // 策略额外需要的品种或其他周期的数据
	OnStartUp           func(s *StratJob) // 启动时回调。初次执行前调用
	OnBar               func(s *StratJob) // 每个K线的回调函数
	OnInfoBar           func(s *StratJob, e *ta.BarEnv, pair, tf string)   // 其他依赖的bar数据
	OnTrades            func(s *StratJob, trades []*banexg.Trade)          // 逐笔交易数据
	OnBatchJobs         func(jobs []*StratJob)                             // 当前时间所有标的job，用于批量开单/平仓
	OnBatchInfos        func(jobs map[string]*StratJob)                    // 当前时间所有info标的job，用于批量处理
	OnCheckExit         func(s *StratJob, od *ormo.InOutOrder) *ExitReq     // 自定义订单退出逻辑
	OnOrderChange       func(s *StratJob, od *ormo.InOutOrder, chgType int) // 订单更新回调
	GetDrawDownExitRate CalcDDExitRate                                     // 计算跟踪止盈回撤退出的比率
	PickTimeFrame       PickTimeFrameFunc                                  // 为指定币选择适合的交易周期
	OnShutDown          func(s *StratJob)                                  // 机器人停止时回调
}
```

## 简单策略示例
```go
package ma

import (
	"github.com/banbox/banbot/config"
	"github.com/banbox/banbot/core"
	"github.com/banbox/banbot/strat"
	ta "github.com/banbox/banta"
)

func init() {
	// 注册策略到banbot中，后续在配置文件中使用ma:demo即可引用此策略
	// `init`函数是go中的特殊函数，会在当前包被导入时立刻执行
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
## banta.BarEnv 和 banta.Series

`banta.BarEnv`是某个技术指标的运行环境，其中存储了当前交易所、市场、品种、时间周期等信息。
一个策略任务至少会需要一个`banta.BarEnv`，如果通过`OnPairInfos`订阅了其他品种或时间周期，则需要多个运行环境。
但需要注意的是，每个交易所、每个市场、每个品种、每个时间周期，只会创建一个运行环境`BarEnv`。

`banta.BarEnv`中内置了几个原始的`Series`，即：`Open`,`High`,`Low`,`Close`,`Volume`，分别保存了开盘价、最高价、最低价、收盘价、成交量的序列信息。

`Series`是`banta`中用于存储序列化数据的特殊结构体。`banta`中的所有技术指标函数，都是接收一个或多个`Series`，经过运算后，返回一个`Series`。

您可通过`Series.Get(0)`获取某个序列的最新值，比如`e.Close.Get(0)`获取最新收盘价；
也可通过`Series.Range(0,5)`获取某个序列最近的5个值，返回长度为5的`[]float64`数组。

当在同一个bar时间执行多次重复的计算时（如实盘多个账号运行同一批策略），`Series`会自动使用缓存的结果，避免重复计算。

对于布林带指标`banta.BBANDS`这样返回`upper/mid/lower`三个部分的指标，其返回的唯一一个`Series`是一个聚合体，不能通过`Get(i)`来获取值。
而应当通过以下方式提取为3个序列对象：
```go
    bbolCols := ta.BBANDS(e.Close, 10, 2, 2).Cols
    upper, mid, lower := bbolCols[0], bbolCols[1], bbolCols[2]
```
然后您可对`upper/mid/lower`分别执行`Get(i)`来获取值。
::: tip 指标运行提示
`banta`是事件驱动的技术指标库。`OnBar`函数会对每一个K线执行一次，也就是说每次调用技术指标只会更新一个最新的值到`Series`中。
而非`ta-lib`那样向量化计算，一次性计算历史所有序列。

`Series`保存了每次指标计算的最新状态，收到新的K线时，会从上次计算状态快速计算，无需重复计算序列的所有数据。

比如`banta.EMA`计算时需要上一个均线值，`ta-lib`向量指标库需要给定整列的历史数据从头计算，而`banta`会从上次缓存的值只计算一次即可。
:::
## 自定义指标

您可以简单快速地实现您的自定义指标逻辑，以`Highest`为例：
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
如上是一个简单的指定周期内最高值的技术指标，所有技术指标的前4行几乎都类似，从`obj`派生得到一个`Series`对象用于保存结果。
其中的`_hh`和`period`参数这里是用作哈希。

实际上`Series`有一个成员属性：
```go
Subs  map[string]map[int]*Series
```
它保存了从该`Series`派生的所有`Series`，本质上策略中所有的`Series`都是由最初的`Open/High/Low/Close/Volume`派生出来的。

由于指标函数每次调用只更新一个值，所以在6-8行长度不足时，直接返回nan。第9行是此指标的关键，计算最近n个序列的最大值返回。

## 更复杂的自定义指标

您的自定义指标可能有时候需要缓存更多的中间状态信息，这时候您可以自定义结构体，然后将其保存在`Series.More`中。
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
上面是一个计算最近n个周期的序列和的指标。其中的11~39行其实可以用下面的一行替换，但上面缓存上一次计算结果的做法，比下面的两次循环效率明显更高。
```go
    // gonum.org/v1/gonum/floats
    return res.Append(floats.Sum(obj.Range(0, period)))
```
## 策略预热  

大多数指标都有一个不稳定的启动期，在此期间它们要么不可用（NaN），要么计算不正确。这可能会导致不一致，因为 banbot 不知道这个不稳定期应该有多长。
为了解决这个问题，可以为策略设置`WarmupNum`属性。这应该设置为策略计算稳定指标所需的最大K线数量。

对于`OnPairInfos`额外订阅的其他品种或周期，您可在其返回值中指定：
```go
    OnPairInfos: func(s *strat.StratJob) []*strat.PairSub {
        return []*strat.PairSub{
            {"_cur_", "1h", 30},
        }
    },
```
上面即额外订阅了当前品种的`1h`周期的K线，预热数量是30.

## 使用其他周期/品种K线 {#info_bar}

您的策略可能不仅仅需要单个品种单个周期，有时候可能需要其他周期K线，或其他品种的K线，您可通过`OnPairInfos`和`OnInfoBar`订阅并使用。
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
如上是一个大小周期结合的均线交叉策略，当大周期短均线位于长均线上方，且小周期短均线上穿长均线时，才入场。

此策略可在yml配置中指定运行在`5m`小周期，同时策略内部指定了订阅`1h`大周期的数据。`OnPairInfos`中`_cur_`表示当前品种，如需要其他品种，可硬编码替换此处的值。

::: tip 注意
`OnInfoBar`仅用于额外K线消费，请勿在此函数中执行开平仓或更新止损等逻辑。
:::

## 保存临时变量

有时候您可能需要保存一些中间状态，用于下次计算；或者需要在不同的回调函数之间同步一些信息。

如[上一节](#info_bar)在`OnBar`中如果要使用`OnInfoBar`的信息，需要经`StratJob.More`中转。

首先在`OnStartUp`中为`StratJob.More`初始化。
然后在`OnBar`和`OnInfoBar`中进行类型转换，并赋值到`m`变量即可：
```go
m, _ := s.More.(*Demo2Sta)
```

## 发出入场信号

发出入场信号只需要调用`StratJob.OpenOrder`方法，并传递一个`*strat.EnterReq`参数即可。

最简单的情况是只对`EnterReq`的`Tag`属性赋值，其他全部使用默认参数。即按默认开单金额和杠杆倍数，打开一个做多订单。没有止盈止损。

下面是`EnterReq`的全部参数：
```go
type EnterReq struct {
	Tag             string  // 入场信号
	StgyName        string  // 策略名称
	Short           bool    // 是否做空
	OrderType       int     // 订单类型, core.OrderType*
	Limit           float64 // 限价单入场价格，指定时订单将作为限价单提交
	CostRate        float64 // 开仓倍率、默认按配置1倍。用于计算LegalCost
	LegalCost       float64 // 花费法币金额。指定时忽略CostRate
	Leverage        float64 // 杠杆倍数
	Amount          float64 // 入场标的数量，由LegalCost和price计算
	StopLossVal     float64 // 入场价格到止损价格的距离，用于计算StopLoss
	StopLoss        float64 // 止损触发价格，不为空时在交易所提交一个止损单
	StopLossLimit   float64 // 止损限制价格，不提供使用StopLoss
	StopLossRate    float64 // 止损退出比例，0表示全部退出，需介于(0,1]之间
	StopLossTag     string  // 止损原因
	TakeProfitVal   float64 // 入场价格到止盈价格的距离，用于计算TakeProfit
	TakeProfit      float64 // 止盈触发价格，不为空时在交易所提交一个止盈单。
	TakeProfitLimit float64 // 止盈限制价格，不提供使用TakeProfit
	TakeProfitRate  float64 // 止盈退出比率，0表示全部退出，需介于(0,1]之间
	TakeProfitTag   string  // 止盈原因
	StopBars        int     // 入场限价单超过多少个bar未成交则取消
}
```

## 发出离场信号

发出离场信号只需要调用`StratJob.CloseOrders`方法，并传递一个`*strat.ExitReq`参数即可。

最简单的情况是只对`ExitReq`的`Tag`属性赋值，其他全部使用默认参数。即以市价单关闭全部订单，包含做多订单和做空订单。

下面是`ExitReq`的全部参数：
```go
type ExitReq struct {
	Tag        string  // 退出信号
	StgyName   string  // 策略名称
	EnterTag   string  // 只退出入场信号为EnterTag的订单
	Dirt       int     // core.OdDirt* long/short/both
	OrderType  int     // 订单类型, core.OrderType*
	Limit      float64 // 限价单退出价格，指定时订单将作为限价单提交
	ExitRate   float64 // 退出比率，默认100%即所有订单全部退出
	Amount     float64 // 要退出的标的数量。指定时ExitRate无效
	OrderID    int64   // 只退出指定订单
	UnOpenOnly bool    // True时只退出尚未入场的订单
	FilledOnly bool    // True时只退出已入场的订单
	Force      bool    // 是否强制退出
}
```

## 止损和止盈

除了在入场时设置订单的止损止盈，您也可以在任意时间，直接设置某个订单的止损止盈：
```go
if len(s.LongOrders) > 0 {
    od := s.LongOrders[0]
    ma5Val := ma5.Get(0)
    od.SetStopLoss(&ormo.ExitTrigger{Price: ma5Val * 0.97})
    od.SetTakeProfit(&ormo.ExitTrigger{Price: ma5Val * 1.03})
}
```
您也可以设置全部订单的止损止盈：
```go
ma5Val := ma5.Get(0)
s.SetAllStopLoss(core.OdDirtLong, &ormo.ExitTrigger{
    Price: ma5Val * 0.97,
    Limit: ma5Val * 0.975,
    Rate:  0.5,
    Tag:   "stop half",
})
```
上面针对所有打开的做多订单，设置50%仓位的止损，价格触发5周期均线的0.97倍时，以0.975倍的限价单止损平仓一半。

## 批量任务处理
有时候您可能需要针对当前策略的所有品种一起进行某些计算（比如相关系数），得到一些中间状态保存，或者一起进行开单或平仓。
这时候您可以使用`OnBatchJobs`或`OnBatchInfos`回调函数。
```go
func calcCorrs(jobs []*strat.StratJob, isBig bool) {
	// 计算各个品种与其他品种的平均相关系数，并保存到More中
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
				// 当大小周期的相关度均低于50%时开单。
				s.OpenOrder(&strat.EnterReq{Tag: "open"})
			} else if m.smlCorr > 0.9 {
				// 当前品种小周期相关度高于90%，平仓
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
## 自定义退出逻辑
您可以在每个K线，为每个打开的订单，执行自定义的退出逻辑检查：
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
				// 盈利超过10%退出
				return &strat.ExitReq{Tag: "profit"}
			}
			return nil
		},
	}
}
```
## 回撤止损（跟踪止损）
您可通过`DrawDownExit`和`GetDrawDownExitRate`方便地实现回撤止损。
比如当某个订单的历史最佳盈利超过10%后，回撤超过50%即退出：

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
				// 订单最佳盈利超过10%后，回撤50%退出
				return 0.5
			}
			return 0
		},
	}
}
```
