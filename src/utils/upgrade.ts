/*
 * @Author: Vane
 * @Date: 2021-08-23 10:28:05
 * @LastEditTime: 2021-08-23 15:42:35
 * @LastEditors: Vane
 * @Description: 升级脚手架
 * @FilePath: \tp-cli\src\utils\upgrade.ts
 */
import chalk from 'chalk'
import inquirer from "inquirer"
import semver from "semver"
import axios from 'axios'
import { NPM_PACKAGE } from '../utils/constants'
import { name, version } from '../../package.json'
import {loadCmd} from '../utils/common'

export async function upgrade(force?: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    axios.get(`${NPM_PACKAGE}${name}`, {timeout: 8000}).then(res => {
      if (res.status === 200) {
        const latest = res.data['dist-tags'].latest
        const local = version
        if (semver.lt(local, latest)) {
          console.log(chalk.yellow(`发现可升级的 ${name} 新版本.`))
          console.log('当前: ' + chalk.gray(local))
          console.log('最新: ' + chalk.green(latest))
  
          if (force) {
              loadCmd(`npm i ${name} -g`, `更新 ${name} `)
              resolve()
          } else {
            inquirer.prompt([{
                type: "confirm",
                name: 'yes',
                message: "是否立刻升级?"
            }]).then(function(answer) {
              if (answer.yes) {
                loadCmd(`npm i ${name} -g --force`, `更新${name}`)
              } 
              resolve()
            })
          }
        } else {
          resolve()
        }
      } else {
        return reject(`脚手架更新检测失败\n`);
      }
    })
    
  })
}
