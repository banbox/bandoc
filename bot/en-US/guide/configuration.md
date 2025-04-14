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
account_pull_secs: 60  # The interval in seconds for regularly updating account balance and positions, default is 60 seconds.
market_type: spot  # Market type: spot for spot trading, linear for USDT-margined contracts, inverse for coin-margined contracts, option for options contracts
contract_type: swap  # swap for perpetual contracts, future for expiring contracts
odbook_ttl: 1000  # Order book expiration time, in milliseconds, default is 500
concur_num: 2  # Concurrent number of symbol candle downloads, default is 2 symbols
order_type: market  # Order type: market for market orders, limit for limit orders
stop_enter_bars: 20  # Cancel the limit entry order if it is not filled within this many candles, default is 0 (disabled)
prefire: 0  # Whether to trigger 10% ahead of the bar’s completion time
margin_add_rate: 0.66  # For futures contracts, add margin when the loss reaches this ratio of the initial margin to avoid liquidation, default is 0.66
stake_amount: 15  # Default amount per order, lower priority than stake_pct
stake_pct: 50  # Percentage of account to use for each order, based on the nominal value
max_stake_amt: 5000  # Max order amount of 5k, valid only if stake_pct is specified
draw_balance_over: 0  # When the balance exceeds this value, the excess amount will be automatically withdrawn and will not be used for subsequent transactions. It is only used for backtesting.
charge_on_bomb: false # Automatically recharge to continue backtesting when backtesting liquidation occurs
take_over_strat: ma:demo # The strategy for taking over user orders during real trading, empty by default
close_on_stuck: 20 # If no K-line is received within 20 minutes, all positions will be closed. The default value is 20. (Only valid for live trading)
open_vol_rate: 1  # Maximum allowed open order quantity / average candle volume ratio when not specifying order quantity, default is 1
min_open_rate: 0.5  # Minimum open order ratio, allows order if balance / per order amount exceeds this ratio when balance is insufficient, default is 0.5 (50%)
low_cost_action: ignore # Action when stake amount < the minimum amount: ignore/keepBig/keepAll
max_simul_open: 0 # Maximum number of simultaneously open orders on one candlestick
bt_net_cost: 15  # Order delay in backtest, can be used to simulate slippage, in seconds, default is 15
relay_sim_unfinish: false  # When trading a new symbol (backtesting/live trading), whether to trading from the open order relay at the beginning time
order_bar_max: 500  # Find the maximum number of bars for forward simulation from the open orders at the start time.
ntp_lang_code: none  # NTP (Network Time Protocol) real-time synchronization. The default is `none`(disabled). Supported codes: zh-CN, zh-HK, zh-TW, ja-JP, ko-KR, zh-SG, and global (indicating global NTP servers such as Google, Apple, Facebook, etc.).
wallet_amounts:  # Wallet balance, used for backtesting
  USDT: 10000
stake_currency: [USDT, TUSD]  # Limit trading pairs to those priced in these currencies
fatal_stop:  # Global stop loss, forbids order placement when total loss reaches these limits
  '1440': 0.1  # 10% loss in a day
  '180': 0.2  # 20% loss in 3 hours
  '30': 0.3  # 30% loss in half an hour
fatal_stop_hours: 8  # Prohibits order placement for this many hours when global stop loss is triggered; default is 8
time_start: "20230701"  # K-line start time, supports timestamp, date, date-time, etc., used for backtesting, data export, etc.
time_end: "20230808"
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
    max_simul_open: 0  # Maximum number of orders opened simultaneously on a candlestick
    order_bar_max: 0  # Overrides the global default order_bar_max when non-zero
    stake_rate: 1 # The stake amount rate for this strategy
    stop_loss: 0 # Stop loss rate for this strategy, e.g., 5% or 0.05
    dirt: any  # any/long/short
    pairs: [BTC/USDT:USDT]
    params: {atr: 15}
    pair_params:
      BTC/USDT:USDT: {atr:14}
    strat_perf:  # Same as root-level strat_perf configuration
      enable: false
strat_perf:
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
  force_filters: false  # apply pairlists to static pairs force; default: false
  pos_on_rotation: hold  # hold/close the position when rotating the symbol list, default: hold
pairlists:  # Filters for trading pairs, applied sequentially in top-down order
  - name: VolumePairList  # Sort all pairs by trading volume in descending order
    limit: 100  # Take the top 100 pairs
    limit_rate: 1 # Cut limit by the rate
    min_value: 100000  # Minimum trading volume value
    cache_secs: 7200  # Cache duration
    back_period: 3d  # TimePeriod for calculating trading volume
  - name: PriceFilter  # Price filter
    max_unit_value: 100  # Max allowed unit price change value (based on quote currency, usually USDT)
    precision: 0.0015  # Filter pairs based on price precision, default requires price changes to be at least 0.1%
    min: 0.001  # Minimum price
    max: 100000  # Maximum price
  - name: RateOfChangeFilter  # Volatility filter
    back_days: 5  # Number of days to review for candle data
    min: 0.03  # Minimum price change ratio
    max: 10  # Maximum price change ratio
    cache_secs: 1440  # Cache duration, in seconds
  - name: SpreadFilter  # Liquidity filter
    max_ratio: 0.005  # Formula: 1 - bid/ask, max price spread ratio allowed
  - name: CorrelationFilter  # Correlation filter
    min: -1  # Filter symbols based on correlation to the market average; default is 0 (disabled)
    max: 1  # Filter symbols based on correlation to the market average; default is 0 (disabled)
    timeframe: 5m  # Timeframe for calculating correlation
    back_num: 70  # Lookback length for correlation data
    sort: asc  # asc/desc/""
    top_n: 50  # Return only the top n symbols with the lowest correlation; default is 0 (no limit)
  - name: VolatilityFilter  # Volatility filter, formula: std(log(c/c1)) * sqrt(back_days)
    back_days: 10  # Number of days to review for candle data
    max: 1  # Maximum volatility score, higher values allow more volatile symbols on the daily level
    min: 0.05  # Minimum volatility score, lower values allow symbols with less volatility on the daily level
  - name: AgeFilter  # Filter symbols based on listing days
    min: 5
  - name: OffsetFilter  # Offset limit filter, typically used last
    reverse: false  # reverse array
    offset: 10  # Start from the 10th item
    rate: 0.5  # 50% of array
    limit: 30  # Take up to 30 items
  - name: ShuffleFilter  # Random shuffle
    seed: 42  # Random seed, optional
accounts:
  user1:  # Account name, can be any name, used in rpc messages
    no_trade: false  # whether to forbid trading in this account
    stake_rate: 1  # stake amount multiplier, based on default
    leverage: 0  # contract leverage, overwrite the default
    max_stake_amt: 0  #  Max allowed stake amount per order
    max_pair: 0  # max pairs number for this account
    max_open_orders: 0  # max open orders for this account
    binance:
      prod:  # API key and secret for production network, required when env is set to prod
        api_key: vvv
        api_secret: vvv
      test:  # API key and secret for test network, required when env is set to test
        api_key: vvv
        api_secret: vvv
    rpc_channels:  # send msg to social app(or control with commands)
      - name: wx_bot
        to_user: ChannelUserID
    api_server:  # password & role for dashboard ui
      pwd: abc
      role: admin
exchange:  # Exchange configuration
  name: binance  # The exchange being used
  binance:  # Parameters for initializing the exchange via banexg, keys will be automatically converted from snake_case to CamelCase.
    # proxy: http://127.0.0.1:10808
    fees:
      linear:  # linear/inverse/main(spot or margin)
        taker: 0.0005
        maker: 0.0002
database:
  retention: all
  max_pool_size: 50
  auto_create: true  # Whether to automatically create the database if it does not exist
  url: postgresql://postgres:123@[127.0.0.1]:5432/ban
spider_addr: 127.0.0.1:6789  # Port and address monitored by the spider process
rpc_channels:  # RPC channels for sending message notifications
  wx_notify:  # Name of the RPC channel
    corp_id: ww0f12345678b7e
    agent_id: '1000005'
    corp_secret: b123456789_1Cx1234YB9K-MuVW1234
    touser: '@all'
    type: wework  # RPC type, supports: wework
    msg_types: [exception]  # Allowed message types to send
    accounts: []  # Allowed accounts, allows all if empty
    keywords: []  # Message filter keywords
    retry_num: 0
    retry_delay: 1000
    disable: true
webhook:  # Message types that can be sent via RPC
  entry:
    content: "{name} {action}\\nSymbol: {pair} {timeframe}\\nTag: {strategy}  {enter_tag}\\nPrice: {price:.5f}\\nCost: {value:.2f}"
  exit:
    content: "{name} {action}\\nSymbol: {pair} {timeframe}\\nTag: {strategy}  {exit_tag}\\nPrice: {price:.5f}\\nCost: {value:.2f}\\nProfit: {profit:.2f}"
  status:  # Bot status messages: start, stop, etc.
    content: '{name}: {status}'
  exception:
    content: '{name}: {status}'
api_server:  # For external control of the bot or access to dashboard via API
  enabled: true
  bind_ip: 0.0.0.0
  port: 8001
  jwt_secret_key: fn234njkcu89234nbf
  users:
    - user: ban
      pwd: 123
      acc_roles: {user1: admin}
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
