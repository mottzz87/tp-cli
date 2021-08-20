/*
 * @Author: Vane
 * @Date: 2021-08-19 21:57:47
 * @LastEditTime: 2021-08-20 11:20:14
 * @LastEditors: Vane
 * @Description: 公共函数
 * @FilePath: \tp-cli\src\utils\common.ts
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
// import { yo } from 'yoo-hoo';
import { version } from '../../package.json';
import symbol from 'log-symbols';
import { exit } from 'process';
import { KEY_GITLAB_USERNAME, KEY_GITLAB_PASSWORD } from './constants';
import Rc from './rc';

// 当前命令行选择的目录
const cwd = process.cwd();

export interface PackageJSON {
  name: string;
  version: string;
  description: string;
  scripts: {
    [key: string]: string;
  };
}

export interface JSON {
  [key: string]: unknown;
}

/**
 * @description:
 * @param {*}
 * @return {*}
 */
const getGitlabAuth = async (): Promise<unknown> => {
  const username = await Rc.get(KEY_GITLAB_USERNAME);
  const password = await Rc.get(KEY_GITLAB_PASSWORD);
  if (username || password) {
    return { username, password };
  } else {
    return {};
  }
};

/**
 * @description: 无授权逻辑
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
};

/**
 * @description 读取指定路径下 json 文件
 * @default
 * @param {string} filename 文件的路径
 */
export function readJsonFile<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(filename, { encoding: 'utf-8', flag: 'r' }));
}

/**
 * @description 覆写指定路径下的 json 文件
 * @default
 * @param {string} filename json 文件的路径
 * @param {T} content json 内容
 */
export function writeJsonFile<T>(filename: string, content: T): void {
  fs.writeFileSync(filename, JSON.stringify(content, null, 2));
}

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
    console.log(symbol.error, chalk.red(`${err}\n`));
  }
  exit(2);
};

const printTeam = (name?: string): void => {
  const [cName] = name?.split('-');
  console.log(
    chalk.red(`
      ==================================================================================
      ==================================================================================
      ==                                                                              ==
      ==                                                                              ==
      ==                          ${chalk.yellow.bold(`- ${cName}前端团队脚手架 -`)}                               ==
      ==                                                                              ==
      ==                                 ${chalk.yellow(`v${version}`)}                                       ==
      ==                                                                              ==
      ==================================================================================
      ==================================================================================
    `),
  );
};

export { printTeam, getGitlabAuth, handleError, handleNoAuth, handleDirExist };
