除了使用banbot的[内置终端命令](../guide/bot_usage.md)，您也可以注册并执行自己的终端命令。

### 注册常规函数
您可通过`entry.AddCmdJob`方法注册终端命令函数：
```go
entry.AddCmdJob(&entry.CmdJob{
    Name:    "hello",
    Parent:  "",
	Run: func(args *config.CmdArgs) *errs.Error {
        fmt.Println("hello")
        return nil
    },
    Options: []string{},
    Help:    "show hello",
})
```
然后您可以通过`bot hello`触发执行`showHello`函数。此函数将接受一个`*config.CmdArgs`参数，存储解析后的命令行参数，如果您需要访问相关参数，请在`Options`中填写需要访问的字段名。
所有可用的字段名可参考[entry/main](https://github.com/banbox/banbot/blob/main/entry/main.go)中的`bindSubFlags`函数。

### 注册任意参数的函数
固定的`Options`和`*config.CmdArgs`可能难以满足您的个性化需求。
您也可以使用RunRaw替换Run，然后自行解析命令行参数：
```go
entry.AddCmdJob(&entry.CmdJob{
    Name:   "hello",
    Parent: "",
    RunRaw: func(args []string) error {
        fmt.Println(strings.Join(args, " "))
        return nil
    },
    Help:    "show hello",
})
```

### 读取数据生成K线图示例
您可以通过上面自定义终端命令，自由调用banbot提供的相关接口，实现各种各样的复杂任务，而不仅仅是内置的回测、交易等。

比如，您可以读取指定品种的K线，然后生成静态html的K线图：[参考代码](https://github.com/banbox/banstrats/tree/main/adv)


