/*
 * @Author: Vane
 * @Date: 2021-08-20 11:49:10
 * @LastEditTime: 2021-08-20 18:22:08
 * @LastEditors: Vane
 * @Description: 项目创建
 * @FilePath: \tp-cli\src\commands\create.ts
 */

import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';

import configData from '../assets/config.json';
import { handleDirExist, IOptions, downloadTemplate, writePackage, initGitLocal, finishedTips } from '../utils/common';

const loading = ora();

export default async (options: IOptions): Promise<void> => {
  const {
    supports: { type: supportType, frame: supportFrame },
    templates,
  } = configData;

  const promps = [];
  

  if(!options.projectName){
    promps.push({
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称: ',
    });
  }

  promps.push({
    type: 'input',
    name: 'description',
    message: '请输入项目描述: ',
    default: 'test'
  });

  if(!options.author){
    promps.push({
      type: 'input',
      name: 'author',
      message: '请输入作者: ',
      default: ''
    });
  }

  if (!options.type) {
    promps.push({
      type: 'list',
      name: 'type',
      message: '请选择要创建的项目类型：',
      default: '',
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


  let answers: IOptions = await inquirer.prompt(promps)
  // 目录已存在提示覆盖
  await handleDirExist(answers);

  // 指令入参、用户选择入参
  answers = {...options, ...answers};
  const { projectName, type, frame, author, description } = answers
  const { url } = templates.PC_Vue;
  if(!url){
    loading.fail(chalk.red(`  >>>> 暂无[${type}]+[${frame}]项目模版`));
    return;
  }
  
  const api = `direct:${url}`;
  await downloadTemplate(projectName, api);

  //录入信息写进package.json
  const pkg = {
    name: projectName, 
    author, 
    description, 
    keywords: [type, frame]
  }
  
  await writePackage(`${projectName}/package.json`, pkg);

  const gitPromps = [
    {
      type: 'confirm',
      name: 'gitLocal',
      message: '是否初始化本地git仓库?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'gitRemote',
      message: '是否创建并关联gitlab远程仓库?',
      default: false,
    },
  ];

  inquirer.prompt(gitPromps).then((answer: IOptions) => {
    const { gitLocal } = answer;
    gitLocal ? initGitLocal({ ...answers, ...answer }) : finishedTips(projectName);
  });
    
  
  
};
