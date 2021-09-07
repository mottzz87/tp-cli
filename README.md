<!--
 * @Author: Vane
 * @Date: 2021-08-19 19:08:17
 * @LastEditTime: 2021-09-07 13:40:33
 * @LastEditors: Vane
 * @Description:
 * @FilePath: \tp-cli\README.md
-->

# tp-cli（因名称易冲突，已更名为 vane-cli）

# 介绍

前端通用脚手架

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

### 代码质量

ESLint + prettier 配合 husky 和 lint-staged，在代码提交时自动校验和修复代码格式
