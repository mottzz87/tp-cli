/*
 * @Author: Vane
 * @Date: 2021-08-19 21:57:47
 * @LastEditTime: 2021-08-20 01:01:41
 * @LastEditors: Vane
 * @Description: 公共函数
 * @FilePath: \tp-cli\src\utils\common.ts
 */
import chalk from 'chalk';
import util from 'util';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { version } from '../../package.json';
// import symbol from 'log-symbols';
import { exit } from 'process';
import { KEY_GITLAB_USERNAME, KEY_GITLAB_PASSWORD } from './constants';
import child_process = require('child_process');

import Rc from './rc';

const exec = util.promisify(child_process.exec);

// 当前命令行选择的目录
const cwd = process.cwd();

/**
 * @description:
 * @param {*}
 * @return {*}
 */
const getGitlabAuth = async (): Promise<unknown> => {
  const username = await Rc.get(KEY_GITLAB_USERNAME);
  const password = await Rc.get(KEY_GITLAB_PASSWORD);
  if (username && password) {
    return { username, password };
  } else {
    return undefined;
  }
};

/**
 * @description:
 * @param {*}
 * @return {*}
 */
const handleNoAuth = async (): Promise<void> => {
  //无授权等提示
  const authInfo = await getGitlabAuth();
  if (!authInfo) {
    console.log(chalk.blueBright('🐶 检测到您未配置gitlab帐号信息，请先配置用户名和密码'));
    console.log(chalk.blueBright('🐶 请执行以下命令，xxx需替换为真实的用户名和密码'));
    console.log('\nExamples:');
    console.log(chalk.yellow('$ tp-cli config set gitlab_username xxx'));
    console.log(chalk.yellow('$ tp-cli config set gitlab_password xxx'));
    exit();
  }
  const cmd_git_user = `git config --get --global user.name`;
  const cmd_git_email = `git config --get --global user.email`;

  try {
    await exec(cmd_git_user);
  } catch (error) {
    console.log(chalk.blueBright('🐶 检测到您未配置git用户信息，请先设置用户名称：'));
    console.log('\nExamples:');
    console.log(chalk.yellow('$ git config --global user.name "Your Name"\n'));
    handleError(error, true);
  }
  try {
    await exec(cmd_git_email);
  } catch (error) {
    console.log(chalk.blueBright('🐶 检测到您未配置git邮箱地址，请先设置邮箱地址：'));
    console.log('\nExamples:');
    console.log(chalk.yellow('$ git config --global user.email "you@example.com"\n'));
    handleError(error, true);
  }
};

/**
 * @description: 目录是否已经存在
 * @param {*} name 项目名称
 * @return {*}
 */
const handleDirExist = async (name: string, options: { force?: boolean }): Promise<unknown> => {
  // 需要创建的目录地址
  const targetAir = path.join(cwd, name);
  if (fs.existsSync(targetAir)) {
    // 是否强制创建？
    if (options?.force) {
      await fs.remove(targetAir);
    } else {
      // TODO：询问用户是否确定要覆盖
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: '目录已存在，请选择',
          choices: [
            {
              name: '覆盖',
              value: 'overwrite',
            },
            {
              name: '退出',
              value: false,
            },
          ],
        },
      ]);

      if (!action) {
        return;
      } else if (action === 'overwrite') {
        // 移除已存在的目录
        console.log(`\r\nRemoving...`);
        await fs.remove(targetAir);
      }
    }
  }
};

/**
 * @description: 异常处理
 * @param {*} err
 * @return {*}
 */
const handleError = (err?: unknown, quiet = false): unknown => {
  if (err && !quiet) {
    console.log(chalk.red(`${err}\n`));
  }
  exit(2);
};

const printTeam = (): void => {
  console.log(
    chalk.blue(`
      ==================================================================================
      ==================================================================================
      ==                                                                              ==
      ==      ▄▄▄▄▄▄▄▄▄▄▄ ▄▄       ▄▄ ▄▄▄▄▄▄▄▄▄▄▄        ▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▄▄▄▄      ==
      ==      ▐░░░░░░░░░░░▐░░▌     ▐░░▐░░░░░░░░░░░▌      ▐░░░░░░░░░░░▐░░░░░░░░░░░▌    ==
      ==      ▐░█▀▀▀▀▀▀▀▀▀▐░▌░▌   ▐░▐░▌▀▀▀▀█░█▀▀▀▀       ▐░█▀▀▀▀▀▀▀▀▀▐░█▀▀▀▀▀▀▀▀▀     ==
      ==      ▐░▌         ▐░▌▐░▌ ▐░▌▐░▌    ▐░▌           ▐░▌         ▐░▌              ==
      ==      ▐░█▄▄▄▄▄▄▄▄▄▐░▌ ▐░▐░▌ ▐░▌    ▐░▌▄▄▄▄▄▄▄▄▄▄▄▐░█▄▄▄▄▄▄▄▄▄▐░█▄▄▄▄▄▄▄▄▄     ==
      ==      ▐░░░░░░░░░░░▐░▌  ▐░▌  ▐░▌    ▐░▐░░░░░░░░░░░▐░░░░░░░░░░░▐░░░░░░░░░░░▌    ==
      ==      ▐░█▀▀▀▀▀▀▀▀▀▐░▌   ▀   ▐░▌    ▐░▌▀▀▀▀▀▀▀▀▀▀▀▐░█▀▀▀▀▀▀▀▀▀▐░█▀▀▀▀▀▀▀▀▀     ==
      ==      ▐░▌         ▐░▌       ▐░▌    ▐░▌           ▐░▌         ▐░▌              ==
      ==      ▐░█▄▄▄▄▄▄▄▄▄▐░▌       ▐░▌    ▐░▌           ▐░▌         ▐░█▄▄▄▄▄▄▄▄▄     ==
      ==      ▐░░░░░░░░░░░▐░▌       ▐░▌    ▐░▌           ▐░▌         ▐░░░░░░░░░░░▌    ==
      ==       ▀▀▀▀▀▀▀▀▀▀▀ ▀         ▀      ▀             ▀           ▀▀▀▀▀▀▀▀▀▀▀     ==
      ==                                                                              ==
      ==                          ${chalk.yellow.bold(`- EMT前端团队脚手架 -`)}                          ==
      ==                                                                              ==
      ==                                   ${chalk.yellow(`v${version}`)}                                     ==   
      ==                                                                              ==
      ==================================================================================
      ==================================================================================
    `),
  );
};

export { printTeam, getGitlabAuth, handleError, handleNoAuth, handleDirExist };
