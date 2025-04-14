## Why not provided precompiled installation packages?
Most quantitative strategies require writing code independently. To balance development efficiency and maximize performance, banbot chooses golang as the unified language for both the system and strategies, which also provides users with the greatest freedom.  
The philosophy of golang is to compile everything (banbot and your strategy code) into a single executable file, which you can easily distribute to anyone and run directly.  
So you only need to [pull the example strategy project](./init_project.md), use the built-in strategies or implement your own, and after compilation, you can experience all functions such as backtesting and live trading.

## What types of quantitative strategies are supported, and which types are not supported?
**Supported Strategies**: Time-series strategies of 1-minute and above (multi-asset and multi-timeframe supported).

**Limited Support**: Multi-factor cross-sectional strategies, AI-driven strategies.

**Not Currently Supported**: High-frequency trading, arbitrage trading (including triangular arbitrage, cross-exchange arbitrage, and term arbitrage, etc.), pair trading, statistical arbitrage.

## Supported markets
Banbot supports Binance's spot, U-margined contracts, and coin-margined contracts. You are welcome to submit pull requests to support more exchanges and markets.

Not currently supported: Stocks, futures, foreign exchange, bonds, decentralized cryptocurrency exchanges, etc.

## Is it stable? Can it be used for real trading in a production environment?

We have been using Banbot in live trading since December 1, 2024. During this period, we have resolved many bugs, and the commonly used live trading features have all passed testing. However, the number of live trading users is still not sufficient at present, and there is a possibility that there are areas not yet covered that could lead to capital losses.

If you want to test the strategy with a small amount of capital, you can consider starting to use Banbot immediately. If you have a large amount of capital, we suggest that you first run a trial with a small amount of capital for a few months to observe the results.

## Can I open a short position?
Banbot supports opening a short position. Just set `Short` to true in `OpenOrders(&strat.EnterReq{Tag: "short", Short: true})`.

## How many orders can be opened at the same time?
Banbot does not limit the number of orders you can open. You can open any number of orders in long or short positions.

## Can I exit only part of the position?
Banbot supports partial exit of positions or orders. Just `CloseOrders(&strat.ExitReq{Tag: "close", ExitRate: 0.5, FilledOnly: true})` to close half of the entered position.
You can also pass in the `OrderID` parameter to exit only half of the position of a specified order.

## Do I need to restart the robot after changing the configuration?
Currently, after you change the configuration, you need to restart the robot for it to take effect. However, after the robot restarts, it will automatically detect the relevant positions and orders and will not be lost.

## The orders in the live trading and backtest do not match?
* Check the live trading log for errors
* Check whether the time zones of the backtest and real market orders are consistent
* Check whether the configurations are consistent: market, leverage, strategy and time period, order amount, etc.

## Error when starting: read tcp 127.0.0.1:xxx->host:5432: wsarecv: An existing connection was forcibly closed by the remote host.
Please make sure that the TimeScaledb plugin has been correctly installed (you can see the TimeScaledb plugin by executing `\dx` in `psql`).

## ormo or ormu reports an error: constraint failed: NOT NULL constraint failed, the corresponding field is float64
If a field type in golang is float64, and the value is nan or inf, it will be treated as null when written to sqlite. If this column is not null, the above error will occur. Solution: Replace utils.NanInfTo(v, 0) with 0 before writing

## Get "https://xxx": unexpected EOF  
This is an error that occurs when the download from the Go repository fails. There could be two possible reasons: the Go repository pointed to by `GOPROXY` is unavailable, or the VPN proxy node is not working. Try switching to resolve the issue.
