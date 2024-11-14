本页介绍如何安装运行机器人的环境。您主要需要准备以下几个部分：
* TimeScaleDB：基于postgresql的高性能时序数据库，用于存储K线和订单等数据。
* golang：建议使用最新版本

banbot开箱即用地支持[banta](https://github.com/banbox/banta)高性能指标库，您可基于其快速开发自定义指标。

## 安装TimeScaleDB数据库
建议按照官方文档安装最新稳定版本：
* [在linux中安装](https://docs.timescale.com/self-hosted/latest/install/installation-linux/)
* [在MacOS中安装](https://docs.timescale.com/self-hosted/latest/install/installation-macos/)
* [在Windows中安装](https://docs.timescale.com/self-hosted/latest/install/installation-windows/)
* [使用Docker安装](https://docs.timescale.com/self-hosted/latest/install/installation-docker/)
::: warning Docker安装提示
执行docker run时，请添加`-v /your/data/dir:/home/postgres/pgdata/data`参数，以便将数据映射到主机目录。
:::

### 时区设置
banbot中所有时间戳全部使用UTC时区，在TimeScaledb中也需要设置为UTC时区。

您可用文本编辑器打开postgresql的配置文件：
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
将其中的`timezone`改为`UTC`即可：
```shell
timezone = 'UTC'
```
重启postgresql服务生效：
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

### 初始化表结构
下载[sql文件](/sql.zip?v=1)，解压缩准备执行。  

使用`psql`工具登录数据库
```shell
psql -d "postgres://<username>:<password>@<host>:<port>"
```
然后创建数据库并执行sql文件:
```postgresql
CREATE database bantd;
\c bantd  -- switch active database
\i /path/to/schema.sql
\i /path/to/schema2.sql
```
::: tip Docker提示
如使用docker启动TimeScaleDB，请将解压后的两个sql文件放在`-v`的主机根目录下。  
然后执行下面命令打开`psql`：
```shell
docker exec -it timescaledb psql -U postgres -h localhost
```
`-i`的sql文件路径应是`/home/postgres/pgdata/data/schema.sql`
:::
检查TimeScaleDB是否已安装：
```postgresql
\dx
```
您会看到已安装的扩展列表：
```text
List of installed extensions
Name     | Version |   Schema   |                                      Description                                      
-------------+---------+------------+---------------------------------------------------------------------------------------
plpgsql     | 1.0     | pg_catalog | PL/pgSQL procedural language
timescaledb | 2.15.1  | public     | Enables scalable inserts and complex queries for time-series data (Community Edition)
```

## 安装golang
请从golang的官网下载[安装](https://go.dev/doc/install)

您可以使用`Visual Studio Code`或`GoLand`作为开发IDE


