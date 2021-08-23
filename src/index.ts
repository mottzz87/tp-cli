/*
 * @Author: Vane
 * @Date: 2021-08-19 19:06:06
 * @LastEditTime: 2021-08-23 15:07:40
 * @LastEditors: Vane
 * @Description: 入口
 * @FilePath: \tp-cli\src\index.ts
 */
import { program } from 'commander';
import chalk from 'chalk';
import { version, description } from '../package.json';
import Rc from './utils/rc';
import { GITLAB_URL } from './utils/constants';
import { printTeam, handleNoAuth, IOptions } from './utils/common';
import {upgrade} from './utils/upgrade'
import { create } from './commands';

program.version(version).description(description);

// create app-name
program
  .command('create')
  .description('Create project, provide initial project template selection')
  .option('-p, --projectName [projectName]', 'Project name')
  .option('-t, --type [H5 | PC | MINIAPP]', 'Project Type')
  .option('-f, --frame [Vue | Taro | React]', 'Technology stack type')
  .option('-au, --author', 'Author')
  .option('-v, --version', 'Version')
  .option('-f, --force', 'If the directory exists, it will be overwritten directly')
  .action(async (options: IOptions) => {
    // 逼格plus
    printTeam('EMT-FE');

    // 无授权自动退出
    await handleNoAuth();

    // 检测升级
    await upgrade()

    //创建
    create(options);
  });

// 配置gitlab 本地存储
program
  .command('config')
  .description('Enter scaffolding gitlab configuration information')
  .action(() => {
    const args = process.argv.slice(3);
    const [action, key, value] = args;
    if (!args.length || !Object.keys(Rc).includes(action)) {
      console.log(chalk.redBright('🙄 Command input error, please refer to the following example command'));
      console.log('\nExamples:');
      console.log(chalk.gray('# Set configuration data'));
      console.log(chalk.yellow(`$ tp-cli config set gitlab_url ${GITLAB_URL}`));
      console.log(chalk.gray('# Read the specified configuration data'));
      console.log(chalk.yellow('$ tp-cli config get gitlab_url'));
      console.log(chalk.gray('# Remove specified configuration data'));
      console.log(chalk.yellow('$ tp-cli config remove gitlab_url'));
      console.log(chalk.gray('# View all configurations'));
      console.log(chalk.yellow('$ tp-cli config get'));
    } else {
      Rc[action](key, value);
    }
  })
  .on('--help', function () {
    console.log('\nExamples:');
    console.log(chalk.gray('# Set configuration data'));
    console.log(chalk.yellow(`$ tp-cli config set gitlab_url ${GITLAB_URL}`));
    console.log(chalk.gray('# Read the specified configuration data'));
    console.log(chalk.yellow('$ tp-cli config get gitlab_url'));
    console.log(chalk.gray('# Remove specified configuration data'));
    console.log(chalk.yellow('$ tp-cli config remove gitlab_url'));
    console.log(chalk.gray('# View all configurations'));
    console.log(chalk.yellow('$ tp-cli config list'));
  });

program.parse(process.argv);
