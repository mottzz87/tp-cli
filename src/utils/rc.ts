/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*
 * @Author: Vane
 * @Date: 2021-08-19 22:22:23
 * @LastEditTime: 2021-08-20 00:56:26
 * @LastEditors: Vane
 * @Description: 系统配置本地存储（${HOME}/.tpclirc）
 * @FilePath: \tp-cli\src\utils\rc.ts
 */
import { decode, encode } from 'ini';
import { promisify } from 'util';
import chalk from 'chalk';
import fs from 'fs';
import { RC } from './constants';
import ora from 'ora';
import { handleError } from './common';

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

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
    if (exit) {
      if (!key) {
        ora().fail(chalk.red(`添加失败: key is required\n`));
        handleError();
      }
      if (!value) {
        ora().fail(chalk.red(`添加失败: value is required\n`));
        handleError();
      }
      opts = await readFile(RC, 'utf8');
      opts = decode(opts);
      Object.assign(opts, { [key]: value });
    } else {
      opts = Object.assign({}, { [key]: value });
    }
    await writeFile(RC, encode(opts), 'utf8');
  },
  /**
   * @description: 读取本地数据(单个或者全部字段)
   * @param {string} key
   * @return {*}
   */
  get: async (key?: string): Promise<unknown> => {
    let opts = {};
    const exit = await exists(RC);
    if (exit) {
      opts = await readFile(RC, 'utf8');
      opts = decode(opts);
      return key ? opts[key] : opts;
    }
    return '';
  },

  /**
   * @description: 删除指定本地数据
   * @param {string} key
   * @return {*}
   */
  remove: async (key: string): Promise<unknown> => {
    let opts = {};
    const exit = await exists(RC);
    if (exit) {
      opts = await readFile(RC, 'utf8');
      opts = decode(opts);
      if (!Object.keys(opts).includes(key)) {
        return 'fail';
      } else {
        delete opts[key];
        await writeFile(RC, encode(opts), 'utf8');
      }
    }
  },

  /**
   * @description: 清空本地配置
   * @param {*}
   * @return {*}
   */
  clear: async (): Promise<void> => {
    await writeFile(RC, '', 'utf8');
  },
};

export default Rc;
