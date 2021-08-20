/*
 * @Author: Vane
 * @Date: 2021-08-19 20:51:36
 * @LastEditTime: 2021-08-20 22:33:29
 * @LastEditors: Vane
 * @Description: 全局变量
 * @FilePath: \tp-cli\src\utils\constants.ts
 */

import { version } from '../../package.json';

/** 用户根目录 */
export const HOME = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

/** 命令-创建 */
export const COMMAND_CREATE = 'create';

/** 命令-配置 */
export const COMMAND_CONFIG = 'config';

/** 脚手架系统目录 */
export const DIR = '.tpcli';

/** 脚手架日志目录 */
export const DIR_LOG = 'logs';

/** 版本号 */
export const VERSION = version;

/** 配置文件目录 */
export const RC = `${HOME}/${DIR}rc`;

/** gitlab url */
export const KEY_GITLAB_URL = 'gitlab_url';

/** gitlab token */
export const KEY_GITLAB_TOKEN = 'gitlab_token';

/** gitlab username */
export const KEY_GITLAB_USERNAME = 'gitlab_username';

/** gitlab password */
export const KEY_GITLAB_PASSWORD = 'gitlab_password';

/** gitlab 二级域名 */
export const GITLAB_ADDR = 'git.mobimedical.cn';

/** gitlab默认url */
export const GITLAB_URL = `http://${GITLAB_ADDR}/api/v4`;

/** gitlab默认token */
export const GITLAB_TOKEN = '';

/** 远程配置地址 */
export const CONFIG_URL = '';
