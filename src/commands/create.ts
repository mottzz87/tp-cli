/*
 * @Author: Vane
 * @Date: 2021-08-20 11:49:10
 * @LastEditTime: 2021-08-23 16:22:32
 * @LastEditors: Vane
 * @Description: 项目创建
 * @FilePath: \tp-cli\src\commands\create.ts
 */

import { initPromps, validateProjectNamePromps, gitPromps } from '../utils/promps';

import { IOptions, downloadTemplate, writePackage, initGit, finishedTips, pingIp } from '../utils/common';

export default async (options: IOptions): Promise<void> => {
  //初始化交互
  let answers: IOptions = await initPromps(options);
  const { projectName, type, frame, author, description, version } = answers;

  // 目录已存在交互
  await validateProjectNamePromps(answers);

  // //检测仓库服务器
  // await pingIp();

  //模板下载
  await downloadTemplate(answers);

  //录入信息写进package.json
  const pkg = { name: projectName, author, description, keywords: [type, frame], version };
  await writePackage(`${projectName}/package.json`, pkg);

  //git初始化交互
  answers = await gitPromps(answers);

  // git初始化
  answers.gitLocal ? initGit(answers) : finishedTips(projectName);

  // The End
};
