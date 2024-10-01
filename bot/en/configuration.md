banbot has a wide range of configuration options. By default, these are configured through the `yaml` configuration file.

## Data Directory
Every time you start backtesting or real trading, you need to pass in the `-datadir` parameter, which is the data directory. You can also configure the environment variable `BanDataDir` and ignore the `-datadir` parameter.

You can store several yaml configuration files in the data directory. When backtesting, a `backtest` subdirectory will be automatically created in the data directory to store the backtest results.

## Yaml Configuration File
banbot can receive several configuration file paths from command line parameters. If the following configuration files have the same configuration as the previous ones, the previous ones will be overwritten.

You can divide the configuration files into multiple parts and pass them in one by one for easy maintenance.

#### Default Configuration File
banbot will try to read two configuration files from the data directory by default: `config.yml` and `config.local.yml`.

You can create these two configuration files directly. You don't need to pass them in when starting banbot, and they will be read automatically.

`config.yml` is recommended to store relatively complete default configurations that do not need to be modified frequently.
It is recommended to store local related configurations in `config.local.yml`, such as exchange api/secret, api_server and other configurations.

## Complete Yaml configuration
```yaml
name: local  # Bot name, used to distinguish different bots in message notifications
env: prod  # Running environment, prod represents production network, test represents test network (Binance testnet), dry_run represents simulation
leverage: 2  # Leverage ratio, only valid in the futures market
limit_vol_secs: 5  # The expiration time for the order book price based on trading volume, in seconds, default is 10
put_limit_secs: 120  # Limit order submission time to the exchange within which it is expected to be filled, in seconds, default is 120
market_type: spot  # Market type: spot for spot trading, linear for USDT-margined contracts, inverse for coin-margined contracts, option for options contracts
contract_type: swap  # swap for perpetual contracts, future for expiring contracts
odbook_ttl: 1000  # Order book expiration time, in milliseconds, default is 500
concur_num: 2  # Concurrent number of symbol K-line downloads, default is 2 symbols
order_type: market  # Order type: market for market orders, limit for limit orders
stop_enter_bars: 20  # Cancel the limit entry order if it is not filled within this many candles, default is 0 (disabled)
prefire: 0  # Whether to trigger 10% ahead of the bar’s completion time
margin_add_rate: 0.66  # For futures contracts, add margin when the loss reaches this ratio of the initial margin to avoid liquidation, default is 0.66
stake_amount: 15  # Default amount per order, lower priority than stake_pct
stake_pct: 50  # Percentage of account to use for each order, based on the nominal value
max_stake_amt: 5000  # Max order amount of 5k, valid only if stake_pct is specified
open_vol_rate: 1  # Maximum allowed open order quantity / average candle volume ratio when not specifying order quantity, default is 1
min_open_rate: 0.5  # Minimum open order ratio, allows order if balance / per order amount exceeds this ratio when balance is insufficient, default is 0.5 (50%)
bt_net_cost: 15  # Order delay in backtest, can be used to simulate slippage, in seconds, default is 15
wallet_amounts:  # Wallet balance, used for backtesting
  USDT: 10000
stake_currency: [USDT, TUSD]  # Limit trading pairs to those priced in these currencies
fatal_stop:  # Global stop loss, forbids order placement when total loss reaches these limits
  '1440': 0.1  # 10% loss in a day
  '180': 0.2  # 20% loss in 3 hours
  '30': 0.3  # 30% loss in half an hour
fatal_stop_hours: 8  # Prohibits order placement for this many hours when global stop loss is triggered; default is 8
timerange: "20230701-20230808"  # K-line data range used for backtesting
run_timeframes: [5m]  # All allowed timeframes for the bot. The strategy will choose the most suitable minimum timeframe; this setting is lower priority than run_policy
run_policy:  # The strategy to run, multiple strategies can run simultaneously or a strategy can be run with different parameters
  - name: Demo  # Strategy name
    run_timeframes: [5m]  # Timeframes supported by this strategy, overrides the root run_timeframes when provided
    filters:  # All filters from pairlists can be used
    - name: OffsetFilter  # Offset limit filter, typically used last
      offset: 10  # Start from the 10th item
      limit: 30  # Take up to 30 items
    max_pair: 999  # Maximum number of symbols allowed for this strategy
    max_open: 10  # Maximum number of open orders for this strategy
    dirt: any  # any/long/short
    pairs: [BTC/USDT:USDT]
    params: {atr: 15}
    pair_params:
      BTC/USDT:USDT: {atr:14}
    strtg_perf:  # Same as root-level strtg_perf configuration
      enable: false
strtg_perf:
  enable: false  # Whether to enable strategy symbol performance tracking, automatically reduces order size for symbols with significant losses
  min_od_num: 5  # Minimum of 5 orders, default is 5; performance will not be calculated if fewer than 5
  max_od_num: 30  # Maximum number of orders in a job, minimum is 8, default is 30
  min_job_num: 10  # Minimum number of symbols, default is 10, minimum is 7
  mid_weight: 0.2  # Weight for orders in the middle performance range
  bad_weight: 0.1  # Weight for orders in the poor performance range
pairs:  # Given trading pairs, if not empty, pairlists will be ignored
- SOL/USDT:USDT
- UNFI/USDT:USDT
- SFP/USDT:USDT
pairmgr:
  cron: '25 1 0 */2 * *' # Second Minute Hour Day Month Weekday
  offset: 0  # Ignore the first n symbols in the list
  limit: 999  # Keep a maximum of n symbols in the list
pairlists:  # Filters for trading pairs, applied sequentially in top-down order
  - name: VolumePairList  # Sort all pairs by trading volume in descending order
    limit: 100  # Take the top 100 pairs
    min_value: 100000  # Minimum trading volume value
    refresh_secs: 7200  # Cache duration
    back_timeframe: 1d  # Timeframe for calculating trading volume, default is 1 day
    back_period: 1  # Multiplier for the trading volume period, back_timeframe * back_period gives the time range
  - name: PriceFilter  # Price filter
    max_unit_value: 100  # Max allowed unit price change value (based on quote currency, usually USDT)
    precision: 0.0015  # Filter pairs based on price precision, default requires price changes to be at least 0.1%
    min: 0.001  # Minimum price
    max: 100000  # Maximum price
  - name: RateOfChangeFilter  # Volatility filter
    back_days: 5  # Number of days to review for K-line data
    min: 0.03  # Minimum price change ratio
    max: 10  # Maximum price change ratio
    refresh_period: 1440  # Cache duration, in seconds
  - name: SpreadFilter  # Liquidity filter
    max_ratio: 0.005  # Formula: 1 - bid/ask, max price spread ratio allowed
  - name: CorrelationFilter  # Correlation filter
    min: -1  # Filter symbols based on correlation to the market average; default is 0 (disabled)
    max: 1  # Filter symbols based on correlation to the market average; default is 0 (disabled)
    timeframe: 5m  # Timeframe for calculating correlation
    back_num: 70  # Lookback length for correlation data
    top_n: 50  # Return only the top n symbols with the lowest correlation; default is 0 (no limit)
  - name: VolatilityFilter  # Volatility filter, formula: std(log(c/c1)) * sqrt(back_days)
    back_days: 10  # Number of days to review for K-line data
    max: 1  # Maximum volatility score, higher values allow more volatile symbols on the daily level
    min: 0.05  # Minimum volatility score, lower values allow symbols with less volatility on the daily level
    refresh_period: 1440  # Cache duration
  - name: AgeFilter  # Filter symbols based on listing days
    min: 5
  - name: OffsetFilter  # Offset limit filter, typically used last
    offset: 10  # Start from the 10th item
    limit: 30  # Take up to 30 items
  - name: ShuffleFilter  # Random shuffle
    seed: 42  # Random seed, optional
exchange:  # Exchange configuration
  name: binance  # The exchange being used
  binance:
    account_prods:  # API key and secret for production network, required when env is set to prod
      user1: # Account name, can be any name, used when sending rpc messages
        api_key: xxx
        api_secret: bbb
        max_stake_amt: 1000  # Max allowed amount per order
        stake_rate: 1  # Order amount multiplier, relative to default
        leverage: 0  # Futures leverage, takes priority over the default
      user2: # Another account
        api_key: xxx
        api_secret: bbb
    account_tests:  # API key and secret for test network, required when env is set to test
      default:
        api_key: xxx
        api_secret: bbb
    options:  # Parameters for initializing the exchange via banexg, keys will be automatically converted from snake_case to camelCase.
```

## Important details configuration
#### Configure single order amount
The minimum order amount depends on the exchange and currency pair, and is usually listed on the exchange support page.

When the robot starts, it will automatically load the exchange market information, which includes the order amount and other restrictions for all varieties. Banbot also limits the minimum single transaction amount to 10USD.

You can configure the single transaction amount through `stake_pct` or `stake_amount`. Note that for futures contracts, these two parameters refer to the nominal value, not the occupied margin.

If you need to use different transaction amounts for different accounts, you can configure the amount multiplier in `exchange.[exg_name].account_prods.user1.stake_rate`. The default is 1; changing it to `<1` will reduce the order amount of this account. `>1` will increase the order amount of this account

Similarly, you can also set different order amount multipliers for different strategies `TradeStrat.StakeRate`

#### Global stop loss
You can use `fatal_stop` to set the robot to stop trading for `fatal_stop_hours` hours when the robot's combined loss of all strategy tasks reaches a certain percentage within x minutes.
