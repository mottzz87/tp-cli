/*
 * @Author: Vane
 * @Date: 2021-08-20 17:55:19
 * @LastEditTime: 2021-09-08 11:11:33
 * @LastEditors: Vane
 * @Description: 脚手架交互
 * @FilePath: \tp-cli\src\utils\promps.ts
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import ora from 'ora';
import fs from 'fs-extra';
import memory from './memory';
import { getGitConfig, IOptions } from './common';
import { GITLAB_ADDR, GIT_CONFIG_URL } from '../config/constants';

// 当前命令行选择的目录
const cwd = process.cwd();

const loading = ora();

/**
 * @description: 模板初始化交互
 * @param {IOptions} options
 * @return {*}
 */
export async function initPromps(options: IOptions): Promise<IOptions> {
  const configData = await getGitConfig(GIT_CONFIG_URL)
  await memory.set('configData', configData)
  const {
    supports: { type: supportType, frame: supportFrame },
  } = configData;
  const promps = [];
  if (!options.projectName) {
    promps.push({
      type: 'input',
      name: 'projectName',
      message: 'Please enter the project name: ',
      validate: (input: string) => {
        if (!input.length) {
          console.log('\n');
          loading.fail(chalk.red(`--projectName Please enter the project name`));
          console.log('\n');
          return false;
        }
        if (!/^(?!-)(?!.*?-$)[^0-9][a-z-0-9]+$/.test(input)) {
          console.log('\n');
          loading.fail(
            chalk.red(
              `--projectName Parameter error, project name format is incorrect, only lowercase letters, numbers, "-" are allowed, and cannot start or end with "-", and cannot start with numbers`,
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
    message: 'Please enter a project description: ',
    default: 'Project description',
  });

  promps.push({
    type: 'input',
    name: 'author',
    message: 'Please enter the author name: ',
    default: 'Team',
  });

  promps.push({
    type: 'input',
    name: 'version',
    message: 'Please enter the version number: ',
    default: '1.0.0',
  });

  if (!options.type) {
    promps.push({
      type: 'list',
      name: 'type',
      message: 'Please select the type of project to create：',
      choices: supportType,
    });
  }

  if (!options.frame) {
    promps.push({
      type: 'list',
      name: 'frame',
      message: 'Please select the technology stack used by the project：',
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
    loading.fail(chalk.red(`The project name is empty, please re-enter`));
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
          message: 'The directory already exists, please select',
          choices: [
            {
              name: 'overwrite',
              value: 'overwrite',
            },
            {
              name: 'exit',
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
        loading.succeed(chalk.green(`Deleted successfully \n`));
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
      message: 'Whether to initialize the local git repository?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'gitRemote',
      message: 'Whether to associate remote git repository?',
      default: false,
    },
  ];
  const answers: IOptions = await inquirer.prompt(promps);

  const gitRepoPromps = answers.gitRemote
    ? [
        {
          type: 'input',
          name: 'gitRepo',
          message: 'Please enter the remote git repository',
          validate: (input: string) => {
            // 匹配.git 后缀
            const suffixReg = /^.*\.(?:git)$/i;
            if (!input.length) {
              console.log('\n');
              loading.fail(chalk.red(`--gitRepo Please enter the remote git repository`));
              console.log('\n');
              return false;
            }
            if (!suffixReg.test(input) || !input.includes(GITLAB_ADDR)) {
              console.log('\n');
              loading.fail(chalk.red(`--gitRepo The address is wrong, please fill in the remote warehouse correctly`));
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
