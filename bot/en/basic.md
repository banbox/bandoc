This page introduces some basic principles and concepts of banbot.

## Related Terminology
* Strategy: Your trading strategy, including how to calculate indicators and open/close positions when receiving candlestick data.
* Order: A complete entry and exit of a strategy execution corresponds to an order.
* Trading Pair/Symbol: The symbol code for a tradeable market on an exchange. For cryptocurrencies, it is usually in the format Base/Quote (e.g., Spot BTC/USDT, USDT-margined contract BTC/USDT:USDT, Coin-margined contract BTC/USDT:BTC).
* Timeframe: The time interval of the trading candlestick (e.g., `5m`, `1h`).
* Indicator: Technical indicators (such as SMA, EMA, RSI, etc.).
* Leverage: Used in futures contracts, Margin = Nominal Value / Leverage.
* TakeProfit: Submitting a limit exit order to the exchange for the current order (e.g., entering a long position at $10, when the price reaches $11, a limit take profit can be set above $11 and wait for execution).
* StopLoss: Setting a stop loss for the current order at the exchange. There are market stop losses and limit stop losses (e.g., entering a long position at $10, when the price reaches $11, a stop loss can be set below $11 as the trigger price).

## Main Components
The execution of backtesting and live trading involves various aspects. To ensure the project's structure remains flexible and clear, the main components involved in banbot include:

* Spider Process: banbot uses a separate spider process to monitor public data from exchanges, write it into the database, and push it in real time via TCP to multiple listening bots. This allows banbot to support running a set of strategies across multiple accounts simultaneously.
* DataProvider: Integrates all the symbols involved in backtesting/live trading (each symbol corresponds to a Feeder, and each Feeder supports multiple timeframes), and executes received candlesticks via callback functions.
* Order Manager (OrderMgr): In backtesting, it matches the order request based on candlesticks; in live trading, it submits the order to the exchange and monitors the execution progress for real-time updates.
* Wallets: During backtesting, it simulates the available balance, frozen amount, unrealized P&L, etc., based on order execution; in live trading, it monitors the exchange's account wallet status for real-time updates.
* Exchange: Based on banexg, it supports Binance's REST/websocket, used for downloading candlesticks, querying market information, order processing, and listening to websocket streams.
* PairFilters: Supports filtering and sorting all symbols based on given filters. Hardcoded symbol lists can also be used.
* Notifications (Notify): Sends notifications when bots open positions or signals appear. Currently, only WeChat is supported.
* Rest API: The rest API can be enabled during live trading, allowing users to view and manage bots via a web UI.

## Key Conventions
**Strategy Job (StratJob)**

A specific symbol + a specific strategy + a specific direction (both/long/short) + any timeframe is only allowed to exist as one strategy job.

For example, with a simple moving average strategy `ma:demo`, you can set parameters for long and short periods passed from the `yml` configuration:

```yaml
run_policy:
  - name: ma:demo
    run_timeframes: [5m]
    dirt: long
    params: {smlLen: 5, bigLen: 20}
    pairs: [BTC/USDT, ETH/USDT]
  - name: ma:demo
    run_timeframes: [5m, 15m]
    dirt: short
    params: {smlLen: 7, bigLen: 30}
    pairs: [BTC/USDT, ETH/USDT]
  - name: ma:demo
    run_timeframes: [15m]
    dirt: long
    params: {smlLen: 4, bigLen: 15}
    pairs: [BCH/USDT, ETC/USDT, BTC/USDT]
  - name: ma:demo
    run_timeframes: [5m]
    dirt: long
    params: {smlLen: 5, bigLen: 20}
    pairs: [BCH/USDT, ETC/USDT]
```
The configuration above sets four groups of strategy jobs, all using the `ma:demo` strategy. Each group can only generate 2 valid strategy jobs (StratJob), for a total of 8 strategy jobs.

The second group provides two timeframes, `[5m 15m]`, and will calculate the candlestick quality score for each timeframe, selecting the smallest timeframe that meets the score criteria.

The `BTC/USDT` in the third group overlaps with the first group, so it will be ignored.

Note: When the dirt parameter is omitted, the default is `both`.

## Backtesting Execution Logic
* Load the configuration and initialize: database session, exchange, data provider, order manager, wallets, pair manager, etc.
* Filter the symbol list to be traded based on the pair manager.
* Load the strategy list, and generate the strategy job list by combining symbols and timeframes.
* Subscribe to relevant symbols and their timeframes from the data provider.
* Call the LoopMain of the data provider to loop through candlesticks over time, and repeat the following logic for each candlestick:
     * Check if the batch entry callback needs to be triggered (triggered when the candlestick timestamp increases).
     * Update the indicator calculation environment.
     * The order manager updates the order based on the candlestick (triggering entry, take profit, stop loss, calculating profit, etc.).
     * Trigger the OnBar, OnCheckExit, GetDrawDownExitRate, OnInfoBar methods for all strategy jobs, and collect entry/exit requests.
     * Submit the entry/exit requests to the order manager for execution.
* Check if the symbol list needs to be refreshed (can be set to refresh periodically during backtesting to simulate live trading).

## Live Trading Execution Logic
* Load the configuration and initialize: database session, exchange, data provider, order manager, wallets, pair manager, notifications, Rest API, etc.
* Filter the symbol list to be traded based on the pair manager.
* Load the strategy list, and generate the strategy job list by combining symbols and timeframes.
* The data provider connects to the spider process and subscribes to relevant symbols and their timeframes.
* Start background tasks: monitor balance, monitor personal orders, periodically refresh trading pairs, periodically update market information, periodically check global stop-loss, etc.
* Call the LoopMain of the data provider to wait for candlestick updates pushed by the spider, and repeat the following logic for each candlestick:
    * Update the indicator calculation environment.
    * The order manager updates order profit based on the candlestick.
    * Trigger the OnBar, OnCheckExit, GetDrawDownExitRate, OnInfoBar methods for all strategy jobs, and collect entry/exit requests.
    * Submit the entry/exit requests to the order manager for execution.
    * Delay execution of batch entry/exit by 3 seconds (if new candlestick data is received within 3 seconds, cancel execution and delay another 3 seconds).