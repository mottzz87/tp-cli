/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*
 * @Author: Vane
 * @Date: 2021-08-19 22:22:23
 * @LastEditTime: 2021-09-08 13:06:53
 * @LastEditors: Vane
 * @Description: 系统配置本地存储（${HOME}/.tpclirc）
 * @FilePath: \tp-cli\src\utils\rc.ts
 */
import { decode, encode } from 'ini';
import { promisify } from 'util';
import chalk from 'chalk';
import fs from 'fs';
import { RC } from '../config/constants';
import ora from 'ora';
import { handleError } from './common';

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const loading = ora();

const Rc = {
  /**
   * @description: 写入本地数据
   * @param {string} key
   * @param {unknown} value
   * @return {*}
   */
  set: async (key: string, value: unknown): Promise<void> => {
    let opts = {};
    const exit = await exists(RC);
    const startTime = Date.now();
    if (exit) {
      if (!key) {
        loading.fail(chalk.red(`添加失败: key is required\n`));
        handleError();
      }
      if (!value) {
        loading.fail(chalk.red(`添加失败: value is required\n`));
        handleError();
      }
      opts = await readFile(RC, 'utf8');
      opts = decode(opts);
      Object.assign(opts, { [key]: value });
    } else {
      opts = Object.assign({}, { [key]: value });
    }
    await writeFile(RC, encode(opts), 'utf8');
    loading.succeed(chalk.green(`新增成功: ${key} => ${value} [耗时${Date.now() - startTime}ms]\n`));
  },

  /**
   * @description: 读取本地数据(单个或者全部字段)
   * @param {string} key
   * @return {*}
   */
  get: async (key?: string): Promise<unknown> => {
    let opts = {};
    const startTime = Date.now();
    const exit = await exists(RC);
    if (exit) {
      opts = await readFile(RC, 'utf8');
      opts = decode(opts);
      if (!key) {
        //查询所有
        Object.keys(opts).forEach((key: string) => {
          console.log(chalk.green(`    -) ${key || 'config'}: ${opts[key]} \n`));
        });
        console.log(chalk.green(`   >>> ${'配置载入成功'} [耗时${Date.now() - startTime}ms]\n`));
      } else if (key) {
        loading.succeed(chalk.green(`>>> ${key}: ${opts[key]} [耗时${Date.now() - startTime}ms]\n`));
      }
      return key ? opts[key] : opts;
    }
    loading.fail(chalk.red(`配置文件不存在 [耗时${Date.now() - startTime}ms]\n`));
    return;
  },

  /**
   * @description: 删除指定本地数据
   * @param {string} key
   * @return {*}
   */
  remove: async (key: string): Promise<void> => {
    let opts = {};
    loading.start(chalk.yellow(`删除配置数据中...\n`));
    const exit = await exists(RC);
    const startTime = Date.now();
    if (exit) {
      opts = await readFile(RC, 'utf8');
      opts = decode(opts);
      if (!opts || !Object.keys(opts).includes(key)) {
        loading.fail(chalk.red(`删除的key不存在 [耗时${Date.now() - startTime}ms]\n`));
      } else {
        delete opts[key];
        await writeFile(RC, encode(opts), 'utf8');
        loading.succeed(chalk.green(`删除配置数据成功 [耗时${Date.now() - startTime}ms]\n`));
      }
    }
  },

  /**
   * @description: 清空本地配置
   * @param {*}
   * @return {*}
   */
  clear: async (): Promise<void> => {
    const startTime = Date.now();
    await writeFile(RC, '', 'utf8');
    loading.succeed(chalk.green(`清空配置数据成功 [耗时${Date.now() - startTime}ms]\n`));
  },
};

export default Rc;
