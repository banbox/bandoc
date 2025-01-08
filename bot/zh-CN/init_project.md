您可从示例策略项目快速开始，也可直接创建新项目。

您无需下载banbot的源代码，而只需创建一个用于管理交易策略的项目，通过`go get`添加banbot依赖，您即可享受banbot带来的全部便利。

## 环境变量
为方便后续使用，您需要设置环境变量`BanDataDir`和`BanStratDir`。

`BanDataDir`是banbot运行过程中回测结果、前端UI资源文件保存的目录。

`BanStratDir`即您的交易策略项目(banstrats)的路径，每次回测时，banbot会自动保存您此次回测对应的策略代码版本，方便您及时恢复到之前的某个版本。

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
::: tip TIP
强烈建议您直接使用此示例项目开始
:::

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
	strat.AddStratGroup("ma", map[string]strat.FuncMakeStrat{
		"demo": Demo,
	})
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
