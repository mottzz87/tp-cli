/*
 * @Author: Vane
 * @Date: 2021-08-19 19:06:06
 * @LastEditTime: 2021-08-20 01:11:16
 * @LastEditors: Vane
 * @Description: 入口
 * @FilePath: \tp-cli\src\index.ts
 */
import { program } from 'commander';
import chalk from 'chalk';
import { version, description } from '../package.json';
import {
  // exec,
  // getGitlabUrl,
  // getGitlabToken,
  // getGitlabAuth,
  // customExec,
  // handleError,
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
    printTeam();

    // 无授权自动退出
    handleNoAuth();

    // 目录已存在提示覆盖
    handleDirExist(name, options);
  });

program
  .command('config')
  .description('录入脚手架配置信息')
  .action(() => {
    const args = process.argv.slice(3);
    if (args.length === 0) {
      console.log(chalk.redBright('🙄 命令输入错误，请参照以下示例命令'));
      console.log('\nExamples:');
      console.log(chalk.gray('# 设置配置数据'));
      console.log(chalk.yellow('$ tp-cli config set gitlab_url http://git.mobimedical.cn/api/v4'));
      console.log(chalk.gray('# 读取指定配置数据'));
      console.log(chalk.yellow('$ tp-cli config get gitlab_url'));
      console.log(chalk.gray('# 移除指定配置数据'));
      console.log(chalk.yellow('$ tp-cli config remove gitlab_url'));
      console.log(chalk.gray('# 查看全部配置列表'));
      console.log(chalk.yellow('$ tp-cli config list'));
    } else {
      console.log(process.argv, args);
    }
  })
  .on('--help', function () {
    console.log('\nExamples:');
    console.log(chalk.gray('# 设置配置数据'));
    console.log(chalk.yellow('$ tp-cli config set gitlab_url http://git.mobimedical.cn/api/v4'));
    console.log(chalk.gray('# 读取指定配置数据'));
    console.log(chalk.yellow('$ tp-cli config get gitlab_url'));
    console.log(chalk.gray('# 移除指定配置数据'));
    console.log(chalk.yellow('$ tp-cli config remove gitlab_url'));
    console.log(chalk.gray('# 查看全部配置列表'));
    console.log(chalk.yellow('$ tp-cli config list'));
  });

program.parse(process.argv);
