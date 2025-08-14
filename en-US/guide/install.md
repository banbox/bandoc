This page describes how to install the environment to run the robot. You mainly need to prepare the following parts:
* TimeScaleDB: a high-performance time series database based on postgresql, Used to store public data such as candlestick (orders, etc. are stored using sqlite).
* golang: it is recommended to use the latest version

Banbot supports the high-performance indicator library [banta](https://github.com/banbox/banta) out of the box, and you can quickly develop custom indicators based on it.

## Install TimeScaleDB database
Installing TimeScaleDB from a software package is quite complex and time-consuming. We strongly recommend [installing with Docker](https://docs.timescale.com/self-hosted/latest/install/installation-docker/).  

When pulling the image, choose the `light` version. Avoid the `-ha` suffix (uses more resources).

::: warning Docker installation tips
When executing docker run, please add the `-v /your/data/dir:/home/postgres/pgdata/data` parameter to map the data to the host directory.
:::
You do not need to manually create the database and table structure. When banbot starts, it will automatically create the database and table structure according to the `database.url` configured in yml.

banbot only uses TimeScaledb to store public data such as candlestick or symbols. The order data during your backtest or real trading will be stored in files through `gob` or `sqlite`.

## Install golang
Please download and install from the official golang website (https://go.dev/doc/install)

We recommend using `Cursor` as IDE, You can also use `Visual Studio Code` or `GoLand`

## Next Steps
After installation, you can continue to follow the instructions in the [Quick Start](./quick_local.md), or review the more detailed documentation one by one: [Initialize Project](./init_project.md), [Command Line](./bot_usage.md)
