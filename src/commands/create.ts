/*
 * @Author: Vane
 * @Date: 2021-08-20 11:49:10
 * @LastEditTime: 2021-08-20 23:56:23
 * @LastEditors: Vane
 * @Description: 项目创建
 * @FilePath: \tp-cli\src\commands\create.ts
 */

import ora from 'ora';
import chalk from 'chalk';
import { initPromps, gitPromps } from '../utils/promps';
import configData from '../assets/config.json';

import { validateProjectName, IOptions, downloadTemplate, writePackage, initGit, finishedTips } from '../utils/common';

const loading = ora();

export default async (options: IOptions): Promise<void> => {
  const { templates } = configData;

  //初始化交互
  let answers: IOptions = await initPromps(options);

  // 目录已存在交互
  await validateProjectName(answers);

  const { projectName, type, frame, author, description, version } = answers;
  const { url } = templates.PC_Vue;

  if (!url) {
    loading.fail(chalk.red(`  >>>> 暂无[${type}]+[${frame}]项目模版`));
    return;
  }

  //模板下载
  const api = `direct:${url}`;
  await downloadTemplate(projectName, api);

  //录入信息写进package.json
  const pkg = {
    name: projectName,
    author,
    description,
    keywords: [type, frame],
    version,
  };

  //更新package
  await writePackage(`${projectName}/package.json`, pkg);

  //git初始化交互
  answers = await gitPromps(answers);

  answers.gitLocal ? initGit(answers) : finishedTips(projectName);
};
