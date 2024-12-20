This page describes how to install the environment to run the robot. You mainly need to prepare the following parts:
* TimeScaleDB: a high-performance time series database based on postgresql, used to store candles, orders and so on.
* golang: it is recommended to use the latest version

Banbot supports the high-performance indicator library [banta](https://github.com/banbox/banta) out of the box, and you can quickly develop custom indicators based on it.

## Install TimeScaleDB database
It is recommended to install the latest stable version according to the official documentation:
* [Installation in linux](https://docs.timescale.com/self-hosted/latest/install/installation-linux/)
* [Installation in MacOS](https://docs.timescale.com/self-hosted/latest/install/installation-macos/)
* [Installation in Windows](https://docs.timescale.com/self-hosted/latest/install/installation-windows/)
* [Installation using Docker](https://docs.timescale.com/self-hosted/latest/install/installation-docker/)
  ::: warning Docker installation tips
  When executing docker run, please add the `-v /your/data/dir:/home/postgres/pgdata/data` parameter to map the data to the host directory.
  :::

## Install golang
Please download and install from the official golang website (https://go.dev/doc/install)

You can use `Visual Studio Code` or `GoLand` as the development IDE
