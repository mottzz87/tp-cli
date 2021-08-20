/*
 * @Author: Vane
 * @Date: 2021-08-19 21:57:47
 * @LastEditTime: 2021-08-20 16:37:16
 * @LastEditors: Vane
 * @Description: 公共函数
 * @FilePath: \tp-cli\src\utils\common.ts
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import ora from 'ora';
import fetch from 'node-fetch';
import downloadGit from 'download-git-repo';
import fs from 'fs-extra';
// import { yo } from 'yoo-hoo';
import { version } from '../../package.json';
import symbol from 'log-symbols';
import { exit } from 'process';
import { KEY_GITLAB_USERNAME, KEY_GITLAB_PASSWORD } from './constants';
import Rc from './rc';

export interface IOptions {
  projectName: string;
  type?: string;
  frame?: string;
  author?: string;
  force?: boolean
}

export interface IAuth {
  username?: string;
  password?: string;
  git_url?: string;
  token?: string
}

// 当前命令行选择的目录
const cwd = process.cwd();

const loading = ora();

interface Obj {
  json: () => unknown;
}

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
export async function getGitlabAuth(): Promise<unknown> {
  const username = await Rc.get(KEY_GITLAB_USERNAME);
  const password = await Rc.get(KEY_GITLAB_PASSWORD);
  if (username || password) {
    return { username, password };
  } else {
    return "";
  }
}

/**
 * @description 项目模板下载
 * @default 
 * @param {string} projectName
 * @param {string} api
 */
 export async function downloadTemplate (projectName: string, api: string): Promise<void> {
  loading.start(chalk.yellow(`开始初始化项目...`));
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    // 各代码仓库用法参考 https://www.npmjs.com/package/download-git-repo
    downloadGit(api, projectName, { clone: true }, (err: unknown) => {
      if (err) {
        reject(`初始化项目失败\n${err}`);
      } else {
        loading.succeed(chalk.green(`恭喜你，模板拉取成功！ [耗时${Date.now() - startTime}ms]\n`));
        resolve();
      }
    });
  });
}

/**
 * @description: 无授权逻辑
 * @param {*}
 * @return {*}
 */
export async function handleNoAuth(): Promise<void> {
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
}

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
 * @description 获取gitlab配置json
 * @default
 * @param {string} filename json 文件的路径
 */
export function getGitConfig<T>(url: string): T {
  
  const startTime = Date.now();
  loading.start(chalk.yellow(`加载远程配置中...\n`));
  return fetch(url)
    .then((res: Obj) => res.json())
    .then((data: unknown) => {
      loading.succeed(chalk.green(`远程配置加载完成 [耗时${Date.now() - startTime}ms]\n`));
      return data;
    });
}

/**
 * @description: 目录是否已经存在
 * @param {*} name 项目名称
 * @return {*}
 */
export async function handleDirExist(options: IOptions): Promise<void> {
  const { projectName } = options;
  // 需要创建的目录地址
  const targetAir = path.join(cwd, projectName);
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
        exit(1)
      } 
      // 移除已存在的目录
      await fs.remove(targetAir);
      loading.succeed(chalk.green(`删除成功 \n`));
    }
  }
}

/**
 * @description: 异常处理
 * @param {*} err
 * @return {*}
 */
export function handleError(err?: unknown, quiet = false): unknown {
  if (err && !quiet) {
    console.log(symbol.error, chalk.red(`${err}\n`));
  }
  exit(2);
}

/**
 * @description 打印文案
 * @default
 * @param {string} name
 */
export function printTeam(name?: string): void {
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
}
