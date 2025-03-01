您可按照下面步骤快速在本地配置并运行banbot而无需docker：

## Step 1. 安装
您需要安装TimeScaledb和Golang开发环境，请参考[指引](./install.md)

## Step 2. 获取示例策略项目并编译
您可使用git直接拉取示例项目：`git clone https://github.com/banbox/banstrats`  
如果您没有安装git工具，也可直接打开[banstrats](https://github.com/banbox/banstrats)网页，下载zip压缩包并解压。

准备好示例策略项目后，进入项目根目录（有`go.mod`的文件夹），在终端（命令行）执行下面命令：

::: code-group
```shell [Linux/MacOS]
# 初始化依赖
go mod tidy

# 将策略和banbot编译为单个可执行文件
go build -o bot
```
```shell [Windows]
# 初始化依赖
go mod tidy

# 将策略和banbot编译为单个可执行文件
go build -o bot.exe
```
:::
<img style="width:480px;margin-top:10px" src="/img/compile.jpg"/>

## Step 3. 配置环境变量
为方便后续使用，您需要设置环境变量`BanDataDir`和`BanStratDir`。

`BanDataDir`是banbot运行过程中回测结果、前端UI资源文件保存的目录。建议设置为一个空目录。

`BanStratDir`即您的交易策略项目(banstrats)的路径，每次回测时，banbot会自动保存您此次回测对应的策略代码版本，方便您及时恢复到之前的某个版本。

比如设置环境变量如下：
```text
BanDataDir=E:\quant\bandata
BanStratDir=E:\quant\banstrats
```

## Step 4. 修改配置文件
在策略项目下，只需执行`bot.exe init`即可在`BanDataDir`下自动初始化配置文件`config.yml`和`config.local.yml`
<img style="width:780px;margin-top:10px" src="/img/init_config.jpg"/>

然后编辑`config.local.yml`文件，设置数据库连接字符串、交易所密钥、单笔金额、交易策略和周期等。

示例：
```yaml
stake_amount: 100
wallet_amounts:
  USDT: 1000
timerange: "20230701-20250101"
pairs: ['ETH/USDT']
run_policy:
  - name: ma:demo
    run_timeframes: [15m]
accounts:
  user1:
    binance:
      prod:
        api_key: vvv
        api_secret: vvv
database:
  url: postgresql://postgres:123@[127.0.0.1]:5432/ban
```

## Step 5. 启动WebUI
在策略项目下，只需执行`bot.exe`即可启动WebUI并自动打开浏览器。

您也可以访问`http://127.0.0.1:8000/zh-CN` 体验。

关于命令行的更多用法[请参考](./bot_usage.md)

<img style="width:780px;margin-top:10px" src="/img/run_webui.jpg"/>
