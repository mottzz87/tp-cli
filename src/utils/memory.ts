/*
 * @Author: Vane
 * @Date: 2021-09-08 10:00:29
 * @LastEditTime: 2021-09-08 11:09:59
 * @LastEditors: Vane
 * @Description: 全局缓存
 * @FilePath: \tp-cli\src\utils\memory.ts
 */

export = (function () {
  const cache = {};
  return {
    get: function (key: string) {
      return cache[key];
    },
    set: async function (key: string, val: unknown) {
      cache[key] = val;
    },
  };
})();
