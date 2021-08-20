/*
 * @Author: Vane
 * @Date: 2021-08-19 21:57:47
 * @LastEditTime: 2021-08-20 22:47:31
 * @LastEditors: Vane
 * @Description: 公共函数
 * @FilePath: \tp-cli\src\utils\common.ts
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import ora from 'ora';
import util from 'util';
import fetch from 'node-fetch';
import downloadGit from 'download-git-repo';
import fs from 'fs-extra';
// import { yo } from 'yoo-hoo';
import { version } from '../../package.json';
import symbol from 'log-symbols';
import { exit } from 'process';
import { KEY_GITLAB_USERNAME, KEY_GITLAB_PASSWORD } from './constants';
import Rc from './rc';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = util.promisify(require('child_process').exec);

export interface IOptions {
  projectName: string;
  type?: string;
  frame?: string;
  author?: string;
  force?: boolean;
  description?: string;
  version?: string;
  gitLocal?: boolean;
  gitRemote?: boolean; // 关联远端分支
  gitRepo?: string; //仓库地址
}

export interface PackageJSON {
  name: string;
  version: string;
  description: string;
  keywords?: unknown[];
  scripts?: {
    [key: string]: string;
  };
}

export interface IAuth {
  username?: string;
  password?: string;
  git_url?: string;
  token?: string;
}

// 当前命令行选择的目录
const cwd = process.cwd();

const loading = ora();

interface Obj {
  json: () => unknown;
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
    return;
  }
}

/**
 * @description 项目模板下载
 * @default
 * @param {string} projectName
 * @param {string} api
 */
export async function downloadTemplate(projectName: string, api: string): Promise<void> {
  loading.start(chalk.yellow(`开始拉取模板...`));
  return new Promise((resolve, reject) => {
    // 各代码仓库用法参考 https://www.npmjs.com/package/download-git-repo
    downloadGit(api, projectName, { clone: true }, (err: unknown) => {
      if (err) {
        reject(`模板拉取失败\n${err}`);
      } else {
        loading.succeed(chalk.green(`模板拉取成功！ \n`));
        resolve();
      }
    });
  });
}

/**
 * @description 写入信息
 * @default
 * @param {string} fileName
 * @param {any} obj
 */
export async function writePackage(fileName: string, obj: unknown): Promise<void> {
  const startTime = Date.now();
  loading.start(chalk.yellow(`开始初始化项目...`));
  // 需要创建的目录地址
  const targetAir = path.join(cwd, fileName);
  return new Promise((resolve) => {
    if (fs.existsSync(targetAir)) {
      const data = fs.readFileSync(targetAir).toString();
      const json = JSON.parse(data);
      Object.keys(obj).forEach((key) => {
        json[key] = obj[key];
      });
      fs.writeFileSync(targetAir, JSON.stringify(json, null, '\t'), 'utf-8');
      loading.succeed(chalk.green(`项目初始化完成！ [耗时${Date.now() - startTime}ms]\n`));
      resolve();
    }
  });
}

// 执行shell命令
export async function loadCmd(cmd: string, text: string): Promise<void> {
  const loading = ora();
  const startTime = Date.now();
  loading.start(chalk.yellow(`${chalk.whiteBright(text)}: 命令执行中...\n`));
  try {
    await exec(cmd);
  } catch (err) {
    console.log('');
    console.log(symbol.error, chalk.red(`execute command failed: ${text}\n`));
    console.log(symbol.info, chalk.redBright(`failed reason: ${err}`));

    exit();
  }
  loading.succeed(chalk.green(`${chalk.whiteBright(text)}: 命令执行完成 [耗时${Date.now() - startTime}ms]\n`));
}

/**
 * @description 初始化git
 * @default
 * @param {IOptions} answer
 */
export async function initGit(answer: IOptions): Promise<void> {
  const { gitRemote, gitRepo } = answer;
  gitRemote && gitRepo ? initGitRemote(answer) : initGitLocal(answer);
}

/**
 * @description 初始化本地分支
 * @default
 * @param {IOptions} answer
 */
export async function initGitLocal(answer: IOptions): Promise<void> {
  const { projectName } = answer;

  await loadCmd(
    `cd ${projectName} && git init && git add . && git commit -m "feat: ✨初始化项目"`,
    '初始化本地git仓库',
  );
  await loadCmd(`cd ${projectName} && git checkout -b develop`, '创建develop分支');
  await loadCmd(`cd ${projectName} && git checkout -b feat/1.0.0`, '创建并切换至feat/1.0.0分支');

  finishedTips(projectName);
}

/**
 * @description 初始化远端分支
 * @default
 * @param {IOptions} answer
 */
export async function initGitRemote(answer: IOptions): Promise<void> {
  const { projectName, gitRepo } = answer;

  await loadCmd(
    `cd ${projectName} && git init && git remote add origin ${gitRepo} && git add . && git commit -m "feat: ✨初始化项目"`,
    '初始化git远端仓库',
  );
  await loadCmd(`cd ${projectName} && git checkout -b develop`, '创建develop分支');
  await loadCmd(`cd ${projectName} && git checkout -b feat/1.0.0`, '创建并切换至feat/1.0.0分支');

  finishedTips(projectName);
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
  if (!projectName) {
    loading.fail(chalk.red(`项目名称为空，请重新输入`));
    return;
  }
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
        exit(1);
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

/**
 * @description The end
 * @default
 * @param {string} projectName
 */
export function finishedTips(projectName?: string): void {
  console.log('\n');
  console.log(chalk.greenBright('🎉 恭喜你，一切准备就绪。完成以下步骤，就可以开启愉快的编码之旅～\n'));
  console.log(chalk.green(`1️⃣  进入项目根目录： ${chalk.yellow(`cd ${projectName}`)}\n`));
  console.log(chalk.green(`2️⃣  安装依赖：${chalk.yellow(`yarn`)}\n`));
  console.log('\n');
}
