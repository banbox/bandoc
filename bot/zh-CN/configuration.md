banbot有非常丰富的配置选项，默认情况下，这些都是通过`yaml`配置文件配置的。

## 数据目录
在每次启动回测或实盘时，您都需要传入`-datadir`参数，即数据目录。您也可以配置环境变量`BanDataDir`，然后忽略`-datadir`参数。

您可以在数据目录中存放若干个yaml配置文件。回测时还会自动在数据目录下创建`backtest`子目录用于存储回测结果。

## Yaml配置文件
banbot可以从命令行参数中接收若干个配置文件路径，后面的配置文件如果有和前面相同的配置，前面的会被覆盖。
您可以将配置文件分为多个部分，依次传入，方便维护。

#### 默认配置文件
banbot会尝试从数据目录下默认读取两个配置文件：`config.yml`和`config.local.yml`。
您可直接创建这两个配置文件，在启动banbot时无需传入，将会自动读取。

`config.yml`中建议存放比较全的不需要经常修改的默认配置。  
`config.local.yml`中建议存放本地相关的配置，如交易所api/secret，api_server等配置。

## 完整Yaml配置
```yaml
name: local  # 机器人名称，用于在消息通知中区分不同机器人
env: prod  # 运行环境，prod表示生产网络，test表示测试网络（币安测试网），dry_run表示模拟
leverage: 2  # 杠杆倍数，仅期货合约市场有效
limit_vol_secs: 5  # 按成交量取订单簿价格的过期时间，单位：秒，默认10
put_limit_secs: 120  # 在此预期时间内能成交的限价单，才提交到交易所，单位：秒，默认120
market_type: spot  # 市场：spot现货，linear：U本位合约，inverse：币本位合约，option：期权合约
contract_type: swap # swao永续合约，future到期合约
odbook_ttl: 1000  # 订单簿过期时间，单位毫秒，默认500
concur_num: 2  # 标的K线并发下载数，默认2个标的
order_type: market  # 下单类型：market市价单  limit限价单
stop_enter_bars: 20  # 限价入场单超过多少个蜡烛未成交则取消入场，默认0不启用
prefire: 0  # 是否在bar即将完成时，提前10%时间触发
margin_add_rate: 0.66  # 交易合约时，如出现亏损，亏损达到初始保证金比率的此值时，进行追加保证金，避免强平，默认0.66
stake_amount: 15  # 单笔订单默认本金，优先级低于stake_pct
stake_pct: 50 # 单笔开单金额百分比，名义价值
max_stake_amt: 5000 # 单笔上限5k，仅stake_pct有值时有效
open_vol_rate: 1 # 未指定数量开单时，最大允许开单数量/平均蜡烛成交量的比值，默认1
min_open_rate: 0.5 # 最小开单比率，余额不足单笔金额时，余额/单笔金额高于此比率允许开单，默认0.5即50%
bt_net_cost: 15 # 回测时下单延迟，可用于模拟滑点，单位：秒，默认15
wallet_amounts:  # 钱包余额，用于回测
  USDT: 10000
stake_currency: [USDT, TUSD]  # 限定只交易定价币为这些的交易对
fatal_stop:  # 全局止损，当全局损失达到限制时，禁止下单
  '1440': 0.1  # 一天损失10%
  '180': 0.2  # 3小时损失20%
  '30': 0.3  # 半小时损失30%
fatal_stop_hours: 8  # 触发全局止损时，禁止开单的小时；默认8
timerange: "20230701-20230808"  # 使用的K线范围，用于回测
run_timeframes: [5m]  # 机器人允许运行的所有时间周期。策略会从中选择适合的最小周期，此处优先级低于run_policy
run_policy:  # 运行的策略，可以多个策略同时运行；也可以一个策略配置不同参数同时运行多个版本
  - name: Demo  # 策略名称
    run_timeframes: [5m]  # 此策略支持的时间周期，提供时覆盖根层级的run_timeframes
    filters:  # 可使用pairlists中的所有过滤器
    - name: OffsetFilter  # 偏移限定数量选择。一般用在最后
      offset: 10  # 从第10个开始取
      limit: 30  # 最多取30个
    max_pair: 999  # 此策略允许的最大标的数量
    max_open: 10  # 此策略最大开单数量
    dirt: any # any/long/short
    pairs: [BTC/USDT:USDT]
    params: {atr: 15}
    pair_params:
      BTC/USDT:USDT: {atr:14}
    strtg_perf: # 和根strtg_perf配置相同
      enable: false
strtg_perf:
  enable: false # 是否启用策略币对效果追踪，自动降低亏损较多的币种开单金额
  min_od_num: 5 # 最小5，默认5，少于5个不计算性能
  max_od_num: 30 # 最大job订单数，最小8，默认30
  min_job_num: 10 # 最小标的数量，默认10，最小7
  mid_weight: 0.2 # 收益中间档的开单权重
  bad_weight: 0.1 # 收益较差档开单权重
pairs:  # 给定交易币种，如不为空，pairlists会被忽略
- SOL/USDT:USDT
- UNFI/USDT:USDT
- SFP/USDT:USDT
pairmgr:
  cron: '25 1 0 */2 * *' # 秒 分钟 小时 天 月 星期
  offset: 0  # 标的列表忽略前n个
  limit: 999 # 标的列表最多保留n个
pairlists:  # 交易对过滤器，按从上到下的顺序逐个过滤应用。
  - name: VolumePairList  # 按成交量价值倒序排序所有交易对
    limit: 100  # 取前100个
    min_value: 100000  # 最低成交量价值
    refresh_secs: 7200  # 缓存时间
    back_timeframe: 1d  # 计算成交量时间周期，默认：天
    back_period: 1  # 计算成交量的乘数，和back_timeframe相乘得到时间范围
  - name: PriceFilter  # 价格过滤器
    max_unit_value: 100  # 最大允许的单位价格变动对应的价值(针对定价货币，一般是USDT)。
    precision: 0.0015  # 按价格精度过滤交易对，默认要求价格变动最小单位是0.1%
    min: 0.001  # 最低价格
    max: 100000  # 最高价格
  - name: RateOfChangeFilter  # 波动性过滤器
    back_days: 5  # 回顾的K线天数
    min: 0.03  # 最小价格变动比率
    max: 10  # 最大价格变动比率
    refresh_period: 1440  # 缓存时间，秒
  - name: SpreadFilter  # 流动性过滤器
    max_ratio: 0.005  # 公式：1-bid/ask，买卖价差占价格的最大比率
  - name: CorrelationFilter  # 相关性过滤器
    min: -1  # 用于过滤当前币种与全市场平均相关性；默认0，表示不启用
    max: 1  # 用于过滤当前币种与全市场平均相关性；默认0，表示不启用
    timeframe: 5m  # 用于计算相关性的数据周期
    back_num: 70  # 计算相关性回顾数据长度
    top_n: 50  # 只返回相关性最低的前n个币种，默认0不限制
  - name: VolatilityFilter  # 波动性过滤器，公式：std(log(c/c1)) * sqrt(back_days)
    back_days: 10  # 回顾的K线天数
    max: 1  # 波动分数最大值，此值越大，允许一些在1d级别上变化非常剧烈的标的
    min: 0.05  # 波动分数最小值，此值越小，允许一些在1d级别上变化非常小的标的
    refresh_period: 1440  # 缓存时间
  - name: AgeFilter  # 按标的的上市天数过滤
    min: 5
  - name: OffsetFilter  # 偏移限定数量选择。一般用在最后
    offset: 10  # 从第10个开始取
    limit: 30  # 最多取30个
  - name: ShuffleFilter  # 随机打乱
    seed: 42  # 随机数种子，可选
exchange:  # 交易所配置
  name: binance  # 当前使用的交易所
  binance:
    account_prods:  # 生产网络的key和secret，指定env: prod时此项必填
      user1: # 这里是账户名字，可任意，会在rpc发消息时使用
        api_key: xxx
        api_secret: bbb
        max_stake_amt: 1000 # 允许的单笔最大金额
        stake_rate: 1 # 开单金额倍率，相对于默认的
        leverage: 0  # 期货杠杆，优先级高于默认的
      user2: # 这里是账户名字
        api_key: xxx
        api_secret: bbb
    account_tests:  # 测试网络的key和secret，指定env: test时此项必填
      default:
        api_key: xxx
        api_secret: bbb
    options:  # 这里传入banexg初始化交易所的参数，key会自动从蛇形转为驼峰。
      proxy: http://127.0.0.1:10808
      fees:
        linear:  # 键可以是：linear/inverse/main(spot or margin)
          taker: 0.0005
          maker: 0.0002
database:  # 数据库配置
  retention: all
  max_pool_size: 10  # 连接池最大大小
  url: postgresql://postgres:123@[127.0.0.1]:5432/bantd3
spider_addr: 127.0.0.1:6789  # 爬虫监听的端口和地址
rpc_channels:  # 支持的全部rpc渠道
  wx_notify:  # rpc的渠道名
    corp_id: ww0f5246485154fgf
    agent_id: '100034234'
    corp_secret: brfgnkerntkjbvheokrgmkg-BfgmierBfgvcx
    touser: '@all'
    type: wework  # rpc类型
    msg_types: [exception]  # 允许发送的消息类型
    accounts: []  # 允许的账户，为空允许所有
    keywords: []  # 消息过滤关键词
    retry_num: 0  # 重试次数
    retry_delay: 1000  # 重试间隔
    disable: false  # 是否禁用
webhook:  # 发送消息的配置
  entry:  # 入场消息
    content: "{name} {action}\n标的：{pair} {timeframe}\n信号：{strategy}  {enter_tag}\n价格：{price:.5f}\n花费：{value:.2f}"
  exit:  # 出场消息
    content: "{name} {action}\n标的：{pair} {timeframe}\n信号：{strategy}  {exit_tag}\n价格：{price:.5f}\n得到：{value:.2f}\n利润：{profit:.2f}"
  status:  # 机器人状态消息：启动，停止等
    content: '{name}: {status}'
  exception:
    content: '{name}: {status}'
api_server:  # 供外部通过api控制机器人
  enabled: true
  bind_ip: 0.0.0.0
  port: 8081
  jwt_secret_key: bnlkrehnt40uyvjgnb234ro97gvb24
  users:
    - user: ban
      pwd: 123
      acc_roles: {user1: admin}

```

## 重要细节配置
#### 配置单笔订单金额
最低开单金额取决于交易所和货币对，通常会列在交易所支持页面上。

机器人启动时会自动加载交易所市场信息，即包含所有品种的开单金额等限制。banbot内部同时限制了最小单笔交易金额是10USD。

您可通过`stake_pct`或`stake_amount`配置单笔交易金额，注意对于期货合约，这两个参数指的是名义价值，而非占用的保证金。

如果您需要对不同的账户使用不同的交易金额，您可在`exchange.[exg_name].account_prods.user1.stake_rate`配置金额倍率，默认为1；改为`<1`则会减少此账户的开单金额。`>1`会增加此账号开单金额

同样，您也可以对不同策略设置不同的开单金额倍率`TradeStrat.StakeRate`

#### 全局止损
您可通过`fatal_stop`设置当机器人在所有策略任务综合x分钟内损失达到百分之多少时，停止交易`fatal_stop_hours`个小时