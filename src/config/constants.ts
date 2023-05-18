/*
 * @Author: Vane
 * @Date: 2021-08-19 20:51:36
 * @LastEditTime: 2021-09-08 13:08:43
 * @LastEditors: Vane
 * @Description: 全局变量
 * @FilePath: \tp-cli\src\config\constants.ts
 */

import { version, bin } from '../../package.json';

const [alias = 'vane'] = Object.keys(bin);

/** 用户根目录 */
export const HOME = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

/** 命令-创建 */
export const COMMAND_CREATE = 'create';

/** 命令-配置 */
export const COMMAND_CONFIG = 'config';

/** 命令-执行别名 */
export const COMMAND_ALIAS = alias;

/** git仓库标识名 */
export const GIT_LIB_NAME = 'gitlab';

/** 脚手架系统目录 */
export const DIR = `.${alias}cli`;

/** 脚手架日志目录 */
export const DIR_LOG = 'logs';

/** 版本号 */
export const VERSION = version;

/** 配置文件目录 */
export const RC = `${HOME}/${DIR}rc`;

/** gitlab url */
export const KEY_GITLAB_URL = GIT_LIB_NAME + '_url';

/** gitlab token */
export const KEY_GITLAB_TOKEN = GIT_LIB_NAME + '_token';

/** gitlab username */
export const KEY_GITLAB_USERNAME = GIT_LIB_NAME + '_username';

/** gitlab password */
export const KEY_GITLAB_PASSWORD = GIT_LIB_NAME + '_password';

/** gitlab 二级域名 */
export const GITLAB_ADDR = 'git.mobimedical.cn';

/** gitlab默认url */
export const GITLAB_URL = `http://${GITLAB_ADDR}/api/v4`;

/** gitlab默认token */
export const GITLAB_TOKEN = '';

/** 项目远程配置url */
export const PRO_CONFIG_URL = 'https://gitee.com/vaned/static/raw/master/js/config.json';

/** npm镜像地址 */
// 如上传至npm源，此处最好设置npm，淘宝镜像并不一定能及时同步到最新的版本信息
export const NPM_PACKAGE = 'https://registry.npmjs.org/';
// export const NPM_PACKAGE = 'https://registry.npm.taobao.org/';

/** 团队log名称 */
export const TEAM_LOGO = 'EMT-FE';
