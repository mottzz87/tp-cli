/*
 * @Author: Vane
 * @Date: 2021-08-20 17:55:19
 * @LastEditTime: 2021-08-21 14:18:37
 * @LastEditors: Vane
 * @Description: 脚手架交互
 * @FilePath: \tp-cli\src\utils\promps.ts
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import ora from 'ora';
import fs from 'fs-extra';
import { IOptions } from './common';
import { GITLAB_ADDR } from './constants';

import configData from '../assets/config.json';

// 当前命令行选择的目录
const cwd = process.cwd();

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
    message: '请输入作者名称: ',
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
 * @description: 目录已存在交互
 * @param {*} name 项目名称
 * @return {*}
 */
export async function validateProjectNamePromps(options: IOptions): Promise<void> {
  const { projectName } = options;
  if (!projectName) {
    loading.fail(chalk.red(`项目名称为空，请重新输入`));
    return;
  }
  // 需要创建的目录地址
  const targetDir = path.join(cwd, projectName);
  if (fs.existsSync(targetDir)) {
    // 是否强制创建？
    if (options?.force) {
      await fs.remove(targetDir);
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
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);
        // 移除已存在的目录
        await fs.remove(targetDir);
        loading.succeed(chalk.green(`删除成功 \n`));
      }
    }
  }
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
