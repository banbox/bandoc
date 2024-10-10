本文档项目使用[vitepress](https://vitepress.dev/)框架。

分为三个子文档站点：
* bot: 机器人文档站点 https://bot.banbox.top
* exg: 交易所文档站点
* ta: 技术指标库文档站点

## 编译和部署
编译机器人文档：
```shell
npm run bot:build
```
然后打包输出目录`bot\.vitepress\dist`上传到服务器：
