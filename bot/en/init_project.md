You can quickly start from the sample strategy project or create a new project directly.

## Start from the sample project
The sample project implements the grid strategy, classic moving average strategy, etc. You can quickly implement your custom strategy based on this.

Open the terminal and run the following command:
```shell
# Pull the sample project code
git clone https://github.com/banbox/banstrats
cd banstrats
# Initialize dependencies
go mod tidy
```

## Initialize a new project
Open the terminal and enter the following command:
```shell
# mystrats is the project name, which can be changed at will
mkdir mystrats
cd mystrats
go mod init mystrats
go get github.com/banbox/banbot
```
First, we create a `ma` folder to store the moving average strategy, create a `demo.go` file in `ma`, and implement our first simple moving average crossover buying and selling strategy:
```go
package ma

import (
	"github.com/banbox/banbot/config"
	"github.com/banbox/banbot/strat"
	ta "github.com/banbox/banta"
)

func init() {
	// Register the policy in Banbot, and use ma: demo in the configuration file to reference this policy later
	// The `init`function is a special function in Go that will be executed immediately when the current package is imported
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
Then create a `main.go` file in the project root directory and write the following code to complete the entry startup file configuration
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
::: tip Style Tips
To maintain the maintainability of various strategies, we recommend placing similar strategies in the same `go package` package, and do not recommend implementing strategies directly in `main.go`. For the specific directory structure, please refer to [Sample Strategy Project](https://github.com/banbox/banstrats)

When backtesting, banbot will automatically back up the strategy source code for this backtest, making it easier to trace the effects of different versions of strategies.
:::