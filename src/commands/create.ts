/*
 * @Author: Vane
 * @Date: 2021-08-20 11:49:10
 * @LastEditTime: 2021-08-20 16:35:30
 * @LastEditors: Vane
 * @Description: 项目创建
 * @FilePath: \tp-cli\src\commands\create.ts
 */

import fs from 'fs-extra';
import ora from 'ora';
import symbol from 'log-symbols';
import chalk from 'chalk';
import inquirer from 'inquirer';

import configData from '../assets/config.json';
import { handleDirExist, IOptions, getGitlabAuth, downloadTemplate } from '../utils/common';

const loading = ora();

export default async (options: IOptions): Promise<void> => {
  const { type, projectName, frame, author } = options

  const {
    supports: { type: supportType, frame: supportFrame },
    templates,
  } = configData;

  const promps = [];
  

  if(!projectName){
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

  if(!author){
    promps.push({
      type: 'input',
      name: 'author',
      message: '请输入作者: ',
      default: ''
    });
  }

  if (!type) {
    promps.push({
      type: 'list',
      name: 'type',
      message: '请选择要创建的项目类型：',
      default: '',
      choices: supportType,
    });
  }
  
  if (!frame) {
    promps.push({
      type: 'list',
      name: 'frame',
      message: '请选择项目使用的技术栈：',
      choices: supportFrame,
    });
  }

  inquirer.prompt(promps).then(async (answer: IOptions) => {
    // 目录已存在提示覆盖
    await handleDirExist(answer);

    // 指令入参、用户选择入参
    const { projectName, type, frame } = {...options, ...answer};
    const { url } = templates.PC_Vue;
    if(!url){
      loading.fail(chalk.red(`  >>>> 暂无[${type}]+[${frame}]项目模版`));
      return;
    }
    
    const api = `direct:${url}`;
    await downloadTemplate(projectName, api);

    
    
  })
  
};
