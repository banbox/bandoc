This is the documentation repository for banbot. This project uses [vitepress](https://vitepress.dev/) to generate the documentation site.

You can download this repository and open it with cursor, then use @codebase in chat to quickly ask questions about all the documents.  
You can also use this repository as a knowledge base and interact with it through AI tools like [cherry studio](https://github.com/CherryHQ/cherry-studio).

It is divided into three sub-documentation sites:
* bot: The bot documentation site https://docs.banbot.site
* exg: The exchange documentation site
* ta: The technical indicator library documentation site

## Compilation and Deployment
To compile the bot documentation:
```shell
npm run bot:build
```
Then package the output directory `bot\.vitepress\dist` and upload it to the server:

这是banbot的文档仓库，本项目使用[vitepress](https://vitepress.dev/)生成文档站点。

您可下载此仓库，然后使用cursor打开，在chat中使用@codebase快速对全部文档进行问答。  
您也可将此仓库作为知识库，通过[cherry studio](https://github.com/CherryHQ/cherry-studio)等AI工具问答。

分为三个子文档站点：
* bot: 机器人文档站点 https://docs.banbot.site
* exg: 交易所文档站点
* ta: 技术指标库文档站点

## 编译和部署
编译机器人文档：
```shell
npm run bot:build
```
然后打包输出目录`bot\.vitepress\dist`上传到服务器：
