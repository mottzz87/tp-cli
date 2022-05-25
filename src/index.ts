/*
 * @Author: Vane
 * @Date: 2021-08-19 19:06:06
 * @LastEditTime: 2021-09-08 13:07:26
 * @LastEditors: Vane
 * @Description: 入口
 * @FilePath: \tp-cli\src\index.ts
 */
import { program } from 'commander';
import chalk from 'chalk';
import { version, description } from '../package.json';
import Rc from './utils/rc';
import { GITLAB_URL, COMMAND_ALIAS, TEAM_LOGO } from './config/constants';
import { upgrade } from './utils/upgrade';
import { printTeam, handleNoAuth, IOptions } from './utils/common';
import { create } from './commands';

program.version(version).description(description);

// create app-name
program
  .command('create')
  .description('创建项目，提供初始化项目模版选择')
  .option('-p, --projectName [projectName]', '项目名称')
  .option('-t, --type [H5 | PC | MINIAPP]', '项目类型')
  .option('-f, --frame [Vue | Taro | React]', '技术栈类型')
  .option('-au, --author', '作者')
  .option('-v, --version', '版本号')
  .option('-f, --force', '若目录存在则直接覆盖')
  .action(async (options: IOptions) => {
    // 逼格plus
    printTeam(TEAM_LOGO);

    // 检测升级
    await upgrade();

    // 无授权自动退出
    await handleNoAuth();

    //创建
    create(options);
  });

// 配置gitlab 本地存储
program
  .command('config')
  .description('录入脚手架gitlab配置信息')
  .action(() => {
    const args = process.argv.slice(3);
    const [action, key, value] = args;
    if (!args.length || !Object.keys(Rc).includes(action)) {
      console.log(chalk.redBright('🙄 Command input error, please refer to the following example command'));
      console.log('\nExamples:');
      console.log(chalk.gray('# Set configuration data'));
      console.log(chalk.yellow(`$ ${COMMAND_ALIAS} config set gitlab_url ${GITLAB_URL}`));
      console.log(chalk.gray('# Read the specified configuration data'));
      console.log(chalk.yellow(`$ ${COMMAND_ALIAS} config get gitlab_url`));
      console.log(chalk.gray('# Remove specified configuration data'));
      console.log(chalk.yellow(`$ ${COMMAND_ALIAS} config remove gitlab_url`));
      console.log(chalk.gray('# View all configurations'));
      console.log(chalk.yellow(`$ ${COMMAND_ALIAS} config get`));
    } else {
      Rc[action](key, value);
    }
  })
  .on('--help', function () {
    console.log('\nExamples:');
    console.log(chalk.gray('# Set configuration data'));
    console.log(chalk.yellow(`$ ${COMMAND_ALIAS} config set gitlab_url ${GITLAB_URL}`));
    console.log(chalk.gray('# Read the specified configuration data'));
    console.log(chalk.yellow(`$ ${COMMAND_ALIAS} config get gitlab_url`));
    console.log(chalk.gray('# Remove specified configuration data'));
    console.log(chalk.yellow(`$ ${COMMAND_ALIAS} config remove gitlab_url`));
    console.log(chalk.gray('# View all configurations'));
    console.log(chalk.yellow(`$ ${COMMAND_ALIAS} config list`));
  });

program.parse(process.argv);
