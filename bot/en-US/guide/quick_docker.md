You can quickly experience banbot's UI and perform strategy development, backtesting, etc. with Docker. You need to start two containers: TimeScaledb and banbot.

::: tip tip
For a better strategy development experience, it is recommended to install the golang environment locally and use `Cursor` to assist with strategy development.
:::

## Start TimeScaledb
```bash
docker network create mynet
docker run -d --name timescaledb --network mynet -p 127.0.0.1:5432:5432 \
  -v /opt/pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=123 timescale/timescaledb:latest-pg17
```
It is recommended to enable `-v` data directory mapping to avoid re-downloading candlesticks when upgrading the image later.

If you are using Windows, you need to modify the host data directory `/opt/pgdata`.

To prevent unauthorized access to your database, it is recommended to only allow local connections, i.e., `-p 127.0.0.1:5432:5432`.

## Start Banbot
Create a local configuration file `/root/config.yml`:
```yaml
accounts:
  user1:  # you can change this
    binance:
      prod:
        api_key: your_api_key_here
        api_secret: your_secret_here
database:
  url: postgresql://postgres:123@[timescaledb]:5432/ban
```
```bash
docker run -d --name banbot -p 8000:8000 --network mynet -v /root:/root banbot/banbot:latest -config /root/config.yml
``` 
Now you can access `http://127.0.0.1:8000` in your browser to experience banbot's UI interface!

## Writing Trading Strategies
You can click the first item in the top navigation bar to switch to the strategy management page. The left file tree has some built-in example strategies from [Banstrats](https://github.com/banbox/banstrats).

You can directly click to expand and view the strategy source code (such as `ma/demo.go`), or create a new strategy directly.

## Running Backtests
You can start new backtest tasks on the backtest management page. All configurations for backtest tasks are done through yaml configuration. You need to specify at least the following configuration:
```yml
time_start: "20240701"
time_end: "20250701"
pairs: ['ETH/USDT']  # You can specify multiple pairs. If omitted, the pair list will be calculated dynamically through pairlists
run_policy:
  - name: ma:demo
    run_timeframes: [15m]
    # params: {atr: 15}
```
