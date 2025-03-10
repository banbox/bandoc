## 支持的市场
banbot支持币安的现货、U本位合约、币本位合约。欢迎您提交pull request支持更多交易所和市场。

## 可以开空头仓位吗？
banbot支持开空头仓位，只需要在`OpenOrders(&strat.EnterReq{Tag: "short", Short: true})`中设置`Short`为true即可。

## 可以同时打开几个订单？
banbot不限制您打开订单的数量，您可以在做多或做空打开任意多个数量的订单。

## 可以只退出仓位的一部分吗？
banbot支持仓位或订单的部分退出。只需要`CloseOrders(&strat.ExitReq{Tag: "close", ExitRate: 0.5, FilledOnly: true})`，即可将已入场的仓位，平仓一半。
您也可以传入`OrderID`参数，只退出指定订单的一半仓位。

## 修改配置后需要重新启动机器人吗？
目前您修改配置后，需要重新启动机器人才能生效。不过机器人重新启动后，会自动检测相关仓位和订单，不会丢失。

## 启动时错误：read tcp 127.0.0.1:xxx->host:5432: wsarecv: An existing connection was forcibly closed by the remote host.
请确认已正确安装TimeScaledb插件（在`psql`中执行`\dx`能看到TimeScaledb插件）。

## 回测时显示"bulk down xx xxx pairs 2024-10-31 ..."，然后一直卡住无响应
可能是数据库进程池大小太小导致批量下载时无法获取数据库会话导致的，请将`database.max_pool_size`改为50或更大后重试

## ormo或ormu报错：constraint failed: NOT NULL constraint failed，对应字段是float64
如果golang某个字段类型float64，而值是nan或inf，写入sqlite时会处理为null，而此列not null时，就会出现上面错误。解决：写入前utils.NanInfTo(v, 0)替换为0

## 实盘和回测的订单不匹配？
* 排查实盘日志是否有错误
* 检查回测和实盘订单时间的时区是否一致
* 检查配置是否一致：市场、杠杆、策略和时间周期、开单金额等
