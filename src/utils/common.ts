/*
 * @Author: Vane
 * @Date: 2021-08-19 21:57:47
 * @LastEditTime: 2021-09-08 13:06:49
 * @LastEditors: Vane
 * @Description: 公共函数
 * @FilePath: \tp-cli\src\utils\common.ts
 */
import chalk from 'chalk';
import path from 'path';
import ora from 'ora';
import util from 'util';
import axios, { AxiosResponse } from 'axios';
import downloadGit from 'download-git-repo';
import fs from 'fs-extra';
// import { yo } from 'yoo-hoo';
import { version } from '../../package.json';
import memory from './memory';
import symbol from 'log-symbols';
import { exit } from 'process';
import { KEY_GITLAB_USERNAME, KEY_GITLAB_PASSWORD, GITLAB_ADDR } from '../config/constants';
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

export interface JSON {
  [key: string]: unknown;
}

export interface IAuth {
  username?: string;
  password?: string;
  git_url?: string;
  token?: string;
}

export interface IGitConfig {
  supports: {
    type: unknown[],
    frame: unknown[]
  },
  template: {
    [key: string]: {
      url: string,
      desc?: string,
      tags?: unknown[]
    }
  }
}

// 当前命令行选择的目录
const cwd = process.cwd();

const loading = ora();

/**
 * @description: 获取username、password
 * @param {*}
 * @return {*}
 */
export async function getGitlabAuth(): Promise<unknown> {
  const username = await Rc.get(KEY_GITLAB_USERNAME);
  const password = await Rc.get(KEY_GITLAB_PASSWORD);
  if (username && password) {
    return { username, password };
  } else {
    return;
  }
}

/**
 * @description ping ip （义幻的gitlab很容易500，故访问前检测ip是否可用）
 * @default 
 * @param {string} ip
 */
export async function pingIp(ip?: string): Promise<void> {
  await loadCmd(`ping ${ip || GITLAB_ADDR}`, 'git远程仓库连接');
}

/**
 * @description 项目模板下载
 * @default 
 * @param {IOptions} options
 */
export async function downloadTemplate(options: IOptions): Promise<void> {
  const configData = await memory.get('configData')
  const { templates } = configData;
  const { projectName, type, frame } = options;
  const { url } = templates[`${type}_${frame}`];
  const api = `direct:${url}`;
  if (!url) {
    loading.fail(chalk.red(`  >>>> 暂无[${type}]+[${frame}]项目模版`));
    return;
  }

  loading.start(chalk.yellow(`开始拉取模板...`));
  return new Promise((resolve, reject) => {
    // 各代码仓库用法参考 https://www.npmjs.com/package/download-git-repo
    downloadGit(api, projectName, { clone: true }, (err: unknown) => {
      if (err) {
        return reject(`模板拉取失败\n${err}`);
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
  loading.start(chalk.yellow(`开始写入${fileName}...`));
  // 需要创建的目录地址
  const targetDir = path.join(cwd, fileName);
  return new Promise((resolve) => {
    if (fs.existsSync(targetDir)) {
      const data = fs.readFileSync(targetDir).toString();
      const json = JSON.parse(data);
      Object.keys(obj).forEach((key) => {
        json[key] = obj[key];
      });
      fs.writeFileSync(targetDir, JSON.stringify(json, null, '\t'), 'utf-8');
      loading.succeed(chalk.green(`文件${fileName}写入完成！ [耗时${Date.now() - startTime}ms]\n`));
      resolve();
    }
  });
}

/**
 * @description: 执行shell命令
 * @param {string} cmd
 * @param {string} text
 * @return {*}
 */
export async function loadCmd(cmd: string, text: string): Promise<void> {
  const loading = ora();
  const startTime = Date.now();
  loading.start(chalk.yellow(`${chalk.whiteBright(text)}: 命令执行中...\n`));
  try {
    await exec(cmd);
  } catch (err) {
    console.log('');
    console.log(symbol.error, chalk.red(`execute command failed: ${text} [耗时${Date.now() - startTime}ms] \n`));
    console.log(symbol.info, chalk.redBright(`failed reason: ${err} \n`));
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
    console.log(chalk.yellow('$ vane config set gitlab_username xxx'));
    console.log(chalk.yellow('$ vane config set gitlab_password xxx'));
    exit();
  }
}

/**
 * @description 获取gitlab配置json
 * @default
 * @param {string} filename json 文件的路径
 */
export function getGitConfig(url: string): Promise<IGitConfig> {
  const startTime = Date.now();
  loading.start(chalk.yellow(`Loading remote configuration...\n`));
  return new Promise((resolve, reject) => {
    axios.get(url).then((data: AxiosResponse) => {
      if(data.status === 200){
        loading.succeed(chalk.green(`Remote configuration loading is complete [Takes ${Date.now() - startTime}ms]\n`));
        resolve(data.data);
      }else{
        return reject(`Failed to get json configuration file`)
      }
    });
  })
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
 * @description The End
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
