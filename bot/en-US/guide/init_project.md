You can quickly start from the sample strategy project or create a new project directly.

You don't need to download the source code of banbot, but just create a project for managing trading strategies. By adding the banbot dependency with `go get`, you can enjoy all the conveniences brought by banbot.

When you execute `go build` under your strategy project, your strategy will be compiled into a single executable file along with the banbot source code. You can use this file for backtesting, live trading, or launching the WebUI, among other tasks.

## Environment variables
For the convenience of subsequent use, you need to set the environment variables `BanDataDir` and `BanStratDir`.

`BanDataDir` expect to be an empty directory. It is the directory where backtest results and frontend UI resource files are saved during the operation of banbot. It is not recommended to set it as a subdirectory of the strategy project.

`BanStratDir` is the path of your trading strategy project(banstrats). Each time you backtest, banbot will automatically save the strategy code version corresponding to your backtest, so that you can restore to a previous version in time.

For example, set the environment variables as follows:
::: code-group

```shell [MacOS]
nano ~/.zshrc
# If you are using a version earlier than Catalina, please use nano ~/.bash_profile
# Append the following lines to the end of the file:
export BanDataDir=/Users/YourName/bandata
export BanStratDir=/Users/YourName/banstrats
# Then save with Ctrl+O and exit with Ctrl+X
# Execute the following command to apply the changes
source ~/.zshrc
```

```shell [Linux]
nano ~/.bashrc
# Append the following lines to the end of the file:
export BanDataDir=/home/YourName/bandata
export BanStratDir=/home/YourName/banstrats
# Then save with Ctrl+O and exit with Ctrl+X
# Execute the following command to apply the changes
source ~/.bashrc
```

```text [Windows]
BanDataDir=E:\quant\bandata
BanStratDir=E:\quant\banstrats
```
:::
Note that generally, you need to open a new terminal window for the changes to take effect.

## Start from the sample project (Recommended)
The sample project implements the grid strategy, classic moving average strategy, etc. You can quickly implement your custom strategy based on this.

Open the terminal and run the following command:
```shell
# Pull the sample project code
git clone https://github.com/banbox/banstrats

cd banstrats
# Initialize dependencies
go mod tidy
```
If you do not have the git tool installed, you can also directly open the [banstrats](https://github.com/banbox/banstrats) webpage, download the zip file, and extract it.

::: tip TIP
It is highly recommended that you start directly with this sample project
:::

## Initialize a new project (For experts)
If you are not sufficiently familiar with banbot, please follow the above instructions to directly use the sample strategy project.

If you are certain about creating a blank strategy project, you can open the terminal and enter the following command:
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
