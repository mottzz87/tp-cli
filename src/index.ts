/*
 * @Author: Vane
 * @Date: 2021-08-19 19:06:06
 * @LastEditTime: 2021-08-20 11:45:12
 * @LastEditors: Vane
 * @Description: 入口
 * @FilePath: \tp-cli\src\index.ts
 */
import { program } from 'commander';
import chalk from 'chalk';
import { version, description } from '../package.json';
import Rc from './utils/rc';
import { GITLAB_URL } from './utils/constants';
import {
  printTeam,
  handleNoAuth,
  handleDirExist,
} from './utils/common';

program.version(version).description(description);

// create app-name
program
  .command('create <app-name>')
  .description('创建项目，提供初始化项目模版选择')
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option('-f, --force', '若目录存在则直接覆盖')
  .action(async (name: string, options: unknown) => {
    // 逼格plus
    printTeam('EMT-FE');

    // 无授权自动退出
    handleNoAuth();

    // 目录已存在提示覆盖
    handleDirExist(name, options);
  });

// 配置gitlab 本地存储
program
  .command('config')
  .description('录入脚手架gitlab配置信息')
  .action(() => {
    const args = process.argv.slice(3);
    if (!args.length) {
      console.log(chalk.redBright('🙄 命令输入错误，请参照以下示例命令'));
      console.log('\nExamples:');
      console.log(chalk.gray('# 设置配置数据'));
      console.log(chalk.yellow(`$ tp-cli config set gitlab_url ${GITLAB_URL}`));
      console.log(chalk.gray('# 读取指定配置数据'));
      console.log(chalk.yellow('$ tp-cli config get gitlab_url'));
      console.log(chalk.gray('# 移除指定配置数据'));
      console.log(chalk.yellow('$ tp-cli config remove gitlab_url'));
      console.log(chalk.gray('# 查看全部配置列表'));
      console.log(chalk.yellow('$ tp-cli config get'));
    } else {
      const [action, key, value] = args;
      Rc[action](key, value);
    }
  })
  .on('--help', function () {
    console.log('\nExamples:');
    console.log(chalk.gray('# 设置配置数据'));
    console.log(chalk.yellow(`$ tp-cli config set gitlab_url ${GITLAB_URL}`));
    console.log(chalk.gray('# 读取指定配置数据'));
    console.log(chalk.yellow('$ tp-cli config get gitlab_url'));
    console.log(chalk.gray('# 移除指定配置数据'));
    console.log(chalk.yellow('$ tp-cli config remove gitlab_url'));
    console.log(chalk.gray('# 查看全部配置列表'));
    console.log(chalk.yellow('$ tp-cli config list'));
  });

program.parse(process.argv);
