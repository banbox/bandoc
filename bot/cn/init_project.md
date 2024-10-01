您可从示例策略项目快速开始，也可直接创建新项目。

## 从示例项目开始
示例项目实现了网格策略、经典均线策略等，您可基于此快速实现您的自定义策略。

打开终端，运行以下命令：
```shell
# 拉取示例项目代码
git clone https://github.com/banbox/banstrats
cd banstrats
# 初始化依赖
go mod tidy
```

## 初始化新项目
打开终端，输入以下命令：
```shell
# mystrats是项目名称，可随意更换
mkdir mystrats
cd mystrats
go mod init mystrats
go get github.com/banbox/banbot
```
首先我们创建一个`ma`文件夹，存放均线类策略，在`ma`中创建`demo.go`文件，实现我们的第一个简单的均线交叉买卖策略：
```go
package ma

import (
	"github.com/banbox/banbot/config"
	"github.com/banbox/banbot/strat"
	ta "github.com/banbox/banta"
)

func init() {
	// 注册策略到banbot中，后续在配置文件中使用ma:demo即可引用此策略
	// `init`函数是go中的特殊函数，会在当前包被导入时立刻执行
	strat.StratMake["ma:demo"] = Demo
}

func Demo(pol *config.RunPolicyConfig) *strat.TradeStrat {
	return &strat.TradeStrat{
		WarmupNum: 100,
		OnBar: func(s *strat.StratJob) {
			e := s.Env
			ma5 := ta.SMA(e.Close, 5)
			ma20 := ta.SMA(e.Close, 20)
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
然后在项目根目录下创建一个`main.go`文件，写入以下代码，即完成了入口启动文件配置
```go
package main

import (
	"github.com/banbox/banbot/entry"
	_ "mystrats/ma"
)

func main() {
	entry.RunCmd()
}
```
::: tip 风格提示
为保持各类策略的可维护性，我们建议将相似策略放在同一个`go package`包中，不建议在`main.go`中直接实现策略。具体目录结构请参考[示例策略项目](https://github.com/banbox/banstrats)

在进行回测时，banbot会自动备份此次回测的策略源代码，方便追溯不同版本策略的效果。
:::
