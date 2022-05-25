<!--
 * @Author: Vane
 * @Date: 2021-08-19 19:08:17
 * @LastEditTime: 2021-09-16 14:04:18
 * @LastEditors: Vane
 * @Description:
 * @FilePath: \tp-cli\README.md
-->

# tp-cli（因名称易冲突，已更名为 vane-cli）

# 介绍

前端通用脚手架, 致力于提升前端研发效率和规范的工程化解决方案

随着业务项目越来越多，单纯的官方 cli 已经不足以满足定制的需要，我们需要一个囊括了已有项目公共组件、开箱即用的工程化项目模板，因此有了这个脚手架

通过该脚手架，你将拥有一支强大的基础项目模板军队，伴你在业务的战场中冲锋陷阵。

# 安装使用

1. 一键安装

```bash
npx vane-cli create
```

2. 全局安装

```bash
npm install -g vane-cli
```

```bash
vane-cli create
```

# 查看版本

```bash
vane --version
1.0.0
```

# 发布

```bash
# 设置镜像源
## 淘宝镜像
## npm config set registry https://registry.npm.taobao.org/
# 目前发布在npm官方仓库
npm config set registry https://registry.npmjs.org

npm login

npm run pub
```

# 调试

此脚本已支持本地调试

# 项目流程

✨✨✨[我是流程图](https://raw.githubusercontent.com/hudiegu/cdn/master/2022-05-25/10:46-4f8vB5.jpg)

# 项目结构

```bash


├─ CHANGELOG.md —————————————————— 提交日志
├─ README.md ————————————————————— 项目介绍
├─ bin
│    └─ cli.js ——————————————————— 命令入口
├─ commitlint.config.js —————————— git提交规范
├─ global.d.ts ——————————————————— 类型声明
├─ package.json
├─ publish.sh ———————————————————— 发布脚本
├─ src
│    ├─ assets ——————————————————— 静态资源
│    │    └─ config.json ————————— 脚手架交互字典，后续迁至服务器
│    ├─ commands
│    │    ├─ create.ts ——————————— 创建项目模板
│    │    └─ index.ts ———————————— 创建入口
│    ├─ config
│    │    └─ constants.ts ———————— 全局配置
│    ├─ index.ts  ———————————————— 脚本入口
│    └─ utils
│           ├─ common.ts ————————— 公共函数
│           ├─ promps.ts ————————— cmd交互
│           ├─ rc.ts ————————————— 本地存储
│           └─ upgrade.ts ———————— 版本升级
├─ tsconfig.json ————————————————— ts
└─ yarn.lock


```

# 代码质量

ESLint + prettier 配合 husky 和 lint-staged，在代码提交时自动校验和修复代码格式
