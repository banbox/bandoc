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

### Set TimeZone
All timestamps in Banbot are in UTC time zone, and it is also necessary to set them to UTC time zone in Timestampdb.

You can use a text editor to open the configuration file for PostgreSQL:
::: code-group
```text [linux]
/var/lib/pgsql/<version>/data/postgresql.conf
/etc/postgresql/<version>/main/postgresql.conf
/usr/local/pgsql/data/postgresql.conf
```
```text [windows]
C:\Program Files\PostgreSQL\<version>\data\postgresql.conf
```
```text [MacOS]
/usr/local/var/postgres/postgresql.conf
```
:::

Change the `timezone` to `UTC`:
```shell
timezone = 'UTC'
```
Restarting PostgreSQL service takes effect:
::: code-group
```shell [linux]
sudo systemctl restart postgresql
```
```shell [windows]
# press Win + R, input: services.msc
# find `postgresql` and restart it
```
```shell [MacOS]
brew services restart postgresql
```
:::

### Initialize the table structure
Download the [sql file](/sql.zip?v=1), unzip it and prepare for execution.

Use the `psql` tool to log in to the database
```shell
psql -d "postgres://<username>:<password>@<host>:<port>"
```
Then create the database and execute the SQL file:
```postgresql
CREATE database bantd;
\c bantd  -- switch active database
\i /path/to/schema.sql
\i /path/to/schema2.sql
```
::: tip Docker Tips
If you use docker to start TimeScaleDB, please put the two decompressed sql files in the host root directory of `-v`.
Then execute the following command to open `psql`:
```shell
docker exec -it timescaledb psql -U postgres -h localhost
```
The sql file path for `-i` should be `/home/postgres/pgdata/data/schema.sql`
:::
Check if TimestampcaleDB is installed:
```postgresql
\dx
```
You’ll see a list of installed extensions:
```text
List of installed extensions
Name     | Version |   Schema   |                                      Description                                      
-------------+---------+------------+---------------------------------------------------------------------------------------
plpgsql     | 1.0     | pg_catalog | PL/pgSQL procedural language
timescaledb | 2.15.1  | public     | Enables scalable inserts and complex queries for time-series data (Community Edition)
```
## Install golang
Please download and install from the official golang website (https://go.dev/doc/install)

You can use `Visual Studio Code` or `GoLand` as the development IDE
