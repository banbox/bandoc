您可通过docker快速体验banbot的UI，并进行策略开发、回测等。您需要启动TimeScaledb和banbot两个容器。

::: tip tip
docker仅用作体验，为获得更好的策略开发体验，建议您本地安装golang环境并使用`Cursor`辅助策略开发。
:::

## 启动TimeScaledb
```bash
docker network create mynet
docker run -d --name timescaledb --network mynet -p 127.0.0.1:5432:5432 \
  -v /opt/pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=123 timescale/timescaledb:latest-pg17
```
建议您启用`-v`数据目录映射，避免后期升级镜像导致K线重新下载。

如您使用windows，则需要修改宿主机数据目录`/opt/pgdata`。

## 启动Banbot
创建一个本地配置文件 `/root/config.yml`:
```yaml
accounts:
  user1:  # 账户名，可修改
    binance:
      prod:
        api_key: your_api_key_here
        api_secret: your_secret_here
database:
  url: postgresql://postgres:123@[timescaledb]:5432/ban
# 中国大陆不能直接访问币安api，请务必设置vpn代理为您本地代理地址，且需在代理软件中允许来自局域网的连接
exchange:
  binance:
    proxy: http://[你的主机本地IP]:[代理端口]
```
执行`ipconfig`或`ifconfig`查看你的本地ip，替换上面`[你的主机本地IP]`，并设置`[代理端口]`为本地vpn代理的端口，然后执行下面命令启动banbot：
```bash
docker run -d --name banbot -p 8000:8000 --network mynet -v /root:/root banbot/banbot:latest -config /root/config.yml
```
现在，您可以在浏览器访问`http://127.0.0.1:8000`，体验banbot的UI界面了！

## 编写交易策略
您点击顶部导航栏第一项，即可切换到策略管理页面。左侧文件树已经内置了一些示例策略，来自[Banstrats](https://github.com/banbox/banstrats)。

您可直接点击展开查看策略的源代码（如`ma/demo.go`），也可以直接创建新策略。

## 执行回测
您可以在回测管理页面，开始新的回测任务，回测任务的所有配置都是通过yaml配置进行的，您至少需要指定以下配置：
```yml
time_start: "20240701"
time_end: "20250701"
pairs: ['ETH/USDT']  # 您可指定多个品种回测，如果忽略此项，则通过pairlists动态计算品种列表
run_policy:
  - name: ma:demo
    run_timeframes: [15m]
    # params: {atr: 15}
```
