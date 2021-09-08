/* eslint-disable no-useless-escape */
/*
 * @Author: Vane
 * @Date: 2021-08-19 21:57:47
 * @LastEditTime: 2021-09-08 11:12:26
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
import { yo } from 'yoo-hoo';
import { version } from '../../package.json';
import memory from './memory'
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
  if (username || password) {
    return { username, password };
  } else {
    return;
  }
}

/**
 * @description ping ip （义幻的gitlab很容易500，故访问前检测ip是否可用）
  
 * @param {string} ip
 */
export async function pingIp(ip?: string): Promise<void> {
  await loadCmd(`ping ${ip || GITLAB_ADDR}`, 'Connect to remote git repository');
}

/**
 * @description 项目模板下载
 * @return {*}
 */
export async function downloadTemplate(options: IOptions): Promise<void> {
  const configData = await memory.get('configData')
  const { templates } = configData;
  const { projectName, type, frame } = options;
  const { url } = templates[`${type}_${frame}`];
  const api = `direct:${url}`;
  if (!url) {
    loading.fail(chalk.red(`  >>>> No [${type}]+[${frame}] project template`));
    return;
  }

  loading.start(chalk.yellow(`Pulling template...`));
  return new Promise((resolve, reject) => {
    // 各代码仓库用法参考 https://www.npmjs.com/package/download-git-repo
    downloadGit(api, projectName, { clone: true }, (err: unknown) => {
      if (err) {
        return reject(`Template pull failed\n${err}`);
      } else {
        loading.succeed(chalk.green(`The template is successfully pulled! \n`));
        resolve();
      }
    });
  });
}

/**
 * @description 写入信息
 * @param {string} fileName
 * @param {any} obj
 */
export async function writePackage(fileName: string, obj: unknown): Promise<void> {
  const startTime = Date.now();
  loading.start(chalk.yellow(`Start writing ${fileName}...`));
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
      loading.succeed(chalk.green(`${fileName} File written successfully! [Takes ${Date.now() - startTime}ms]\n`));
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
  loading.start(chalk.yellow(`${chalk.whiteBright(text)}: The command is executing......\n`));
  try {
    await exec(cmd);
  } catch (err) {
    console.log('');
    console.log(symbol.error, chalk.red(`execute command failed: ${text} [Takes ${Date.now() - startTime}ms] \n`));
    console.log(symbol.info, chalk.redBright(`failed reason: ${err} \n`));
    exit();
  }
  loading.succeed(
    chalk.green(`${chalk.whiteBright(text)}: The command is executing... [Takes ${Date.now() - startTime}ms]\n`),
  );
}

/**
 * @description 初始化git
 * @param {IOptions} answer
 */
export async function initGit(answer: IOptions): Promise<void> {
  const { gitRemote, gitRepo } = answer;
  gitRemote && gitRepo ? initGitRemote(answer) : initGitLocal(answer);
}

/**
 * @description 初始化本地分支
 * @param {IOptions} answer
 */
export async function initGitLocal(answer: IOptions): Promise<void> {
  const { projectName } = answer;

  await loadCmd(
    `cd ${projectName} && git init && git add . && git commit -m "feat: ✨Initialize the project"`,
    'Initialize the local git repository',
  );
  await loadCmd(`cd ${projectName} && git checkout -b develop`, 'Create a develop branch');
  await loadCmd(`cd ${projectName} && git checkout -b feat/1.0.0`, 'Create and switch to feat/1.0.0 branch');

  finishedTips(projectName);
}

/**
 * @description 初始化远端分支
 * @param {IOptions} answer
 */
export async function initGitRemote(answer: IOptions): Promise<void> {
  const { projectName, gitRepo } = answer;

  await loadCmd(
    `cd ${projectName} && git init && git remote add origin ${gitRepo} && git add . && git commit -m "feat: ✨Initialize the project"`,
    'Initialize the remote git repository',
  );
  await loadCmd(`cd ${projectName} && git checkout -b develop`, 'Create a develop branch');
  await loadCmd(`cd ${projectName} && git checkout -b feat/1.0.0`, 'Create and switch to feat/1.0.0 branch');

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
    console.log(
      chalk.blueBright(
        '🐶 It is detected that you have not configured the gitlab account information, please configure the user name and password first',
      ),
    );
    console.log(
      chalk.blueBright(
        '🐶 Please execute the following command, xxx needs to be replaced with the real user name and password',
      ),
    );
    console.log('\nExamples:');
    console.log(chalk.yellow('$ vane config set gitlab_username xxx'));
    console.log(chalk.yellow('$ vane config set gitlab_password xxx'));
    exit();
  }
}

/**
 * @description 获取gitlab配置json
 * @param {string} url
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
 * @param {string} name
 */
export function printTeam(name?: string): void {
  const [cName] = name?.split('-');
  yo(name, { color: 'blue', spacing: 2 });
  console.log(
    chalk.red(`


                                                            ${chalk.yellow.bold(`—— ${cName}前端团队脚手架 `)}
                                          
                                                                       ${chalk.yellow(`v${version}`)}
    `),
  );
}

/**
 * @description The End
  
 * @param {string} projectName
 */
export function finishedTips(projectName?: string): void {
  console.log('\n');
  console.log(chalk.greenBright('🎉 Congratulations, everything is ready。\n'));
  console.log(chalk.green(`1️⃣   ${chalk.yellow(`cd ${projectName}`)}\n`));
  console.log(chalk.green(`2️⃣   ${chalk.yellow(`yarn`)}\n`));
  console.log('\n');
}
