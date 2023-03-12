import { NextRouter } from "next/router";

export const onBeforePopState = (router: NextRouter, customBackUrl: string, cb?: Function) => {
  router.beforePopState(({ url, as, options }) => {
    !!cb && cb();
    if (as !== customBackUrl) {
      router.push(customBackUrl);
      return false;
    }
    return true;
  });
};
