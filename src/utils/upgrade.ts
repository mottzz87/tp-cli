/*
 * @Author: Vane
 * @Date: 2021-08-23 10:28:05
 * @LastEditTime: 2021-09-01 16:54:18
 * @LastEditors: Vane
 * @Description: 升级脚手架
 * @FilePath: \tp-cli\src\utils\upgrade.ts
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import semver from 'semver';
import axios from 'axios';
import { NPM_PACKAGE } from '../utils/constants';
import { name, version } from '../../package.json';
import { loadCmd } from '../utils/common';

export async function upgrade(force?: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    axios.get(`${NPM_PACKAGE}${name}`, { timeout: 8000 }).then((res) => {
      if (res.status === 200) {
        const latest = res.data['dist-tags'].latest;
        const local = version;
        if (semver.lt(local, latest)) {
          console.log(chalk.yellow(`Found an upgradeable new version of ${name}.`));
          console.log('current: ' + chalk.gray(local));
          console.log('latest: ' + chalk.green(latest));

          if (force) {
            loadCmd(`npm i ${name} -g`, `update ${name} `);
            resolve();
          } else {
            inquirer
              .prompt([
                {
                  type: 'confirm',
                  name: 'yes',
                  message: 'Whether to upgrade now?',
                },
              ])
              .then(function (answer) {
                if (answer.yes) {
                  loadCmd(`npm i ${name} -g --force`, `update${name}`);
                }
                resolve();
              });
          }
        } else {
          resolve();
        }
      } else {
        return reject(`Cli update detection failed\n`);
      }
    });
  });
}
