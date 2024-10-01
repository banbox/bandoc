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

