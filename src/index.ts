/*
 * @Author: Vane
 * @Date: 2021-08-19 19:06:06
 * @LastEditTime: 2021-08-19 19:22:55
 * @LastEditors: Vane
 * @Description:
 * @FilePath: \tp-cli\src\index.ts
 */
import { program } from 'commander';

// tp-cli -v、tp-cli --version
program
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  .version(`${require('../package.json').version}`, '-v --version')
  .usage('<command> [options]');

// tp-cli create newPro
program
  .command('create <app-name>')
  .description('Create new project from => tp-cli create yourProjectName')
  .action(async (name: string) => {
    console.log(name);
  });

program.parse(process.argv);
