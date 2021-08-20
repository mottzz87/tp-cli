/*
 * @Author: Vane
 * @Date: 2021-08-20 17:55:19
 * @LastEditTime: 2021-08-20 22:50:41
 * @LastEditors: Vane
 * @Description: 项目交互
 * @FilePath: \tp-cli\src\utils\promps.ts
 */
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { IOptions } from './common';
import { GITLAB_ADDR } from './constants';

import configData from '../assets/config.json';

const loading = ora();

/**
 * @description: 模板初始化交互
 * @param {IOptions} options
 * @return {*}
 */
export async function initPromps(options: IOptions): Promise<IOptions> {
  const {
    supports: { type: supportType, frame: supportFrame },
  } = configData;
  const promps = [];
  if (!options.projectName) {
    promps.push({
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称: ',
      validate: (input: string) => {
        if (!input.length) {
          console.log('\n');
          loading.fail(chalk.red(`--projectName 请输入项目名称`));
          console.log('\n');
          return false;
        }
        if (!/^(?!-)(?!.*?-$)[^0-9][a-z-0-9]+$/.test(input)) {
          console.log('\n');
          loading.fail(
            chalk.red(
              `--projectName 参数错误，项目名称格式不正确，仅允许小写字母、数字、"-"，且不能以"-"开头或结尾，不能以数字开头`,
            ),
          );
          console.log('\n');
          return false;
        }
        return true;
      },
    });
  }

  promps.push({
    type: 'input',
    name: 'description',
    message: '请输入项目描述: ',
    default: '项目描述',
  });

  promps.push({
    type: 'input',
    name: 'author',
    message: '请输入作者: ',
    default: 'Team',
  });

  promps.push({
    type: 'input',
    name: 'version',
    message: '请输入版本号: ',
    default: '1.0.0',
  });

  if (!options.type) {
    promps.push({
      type: 'list',
      name: 'type',
      message: '请选择要创建的项目类型：',
      choices: supportType,
    });
  }

  if (!options.frame) {
    promps.push({
      type: 'list',
      name: 'frame',
      message: '请选择项目使用的技术栈：',
      choices: supportFrame,
    });
  }
  const answers: IOptions = await inquirer.prompt(promps);
  return { ...options, ...answers };
}

/**
 * @description: git初始化交互
 * @param {*}
 * @return {*}
 */
export async function gitPromps(options: IOptions): Promise<IOptions> {
  const promps = [
    {
      type: 'confirm',
      name: 'gitLocal',
      message: '是否初始化本地git仓库?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'gitRemote',
      message: '是否关联gitlab远程仓库?',
      default: false,
    },
  ];
  const answers: IOptions = await inquirer.prompt(promps);

  const gitRepoPromps = answers.gitRemote
    ? [
        {
          type: 'input',
          name: 'gitRepo',
          message: '请输入gitlab远程仓库地址',
          validate: (input: string) => {
            // 匹配.git 后缀
            const suffixReg = /^.*\.(?:git)$/i;
            if (!input.length) {
              console.log('\n');
              loading.fail(chalk.red(`--gitRepo 请输入远程仓库地址`));
              console.log('\n');
              return false;
            }
            if (!suffixReg.test(input) || !input.includes(GITLAB_ADDR)) {
              console.log('\n');
              loading.fail(chalk.red(`--gitRepo 地址错误，请正确填写远程仓库`));
              console.log('\n');
              return false;
            }
            return true;
          },
        },
      ]
    : [];
  const gitRepoAnswer: IOptions = await inquirer.prompt(gitRepoPromps);

  return { ...options, ...answers, ...gitRepoAnswer };
}
