// src/helpers/isEnv.helper.ts
export enum ENVIRONMENTS {
  TEST = 'test',
  PROD = 'production',
  DEV = 'development',
}

export function isTestEnv(): boolean {
  return process.env.NODE_ENV === ENVIRONMENTS.TEST;
}

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === ENVIRONMENTS.PROD;
}

export function isDevEnv(): boolean {
  return process.env.NODE_ENV === ENVIRONMENTS.DEV;
}

export function isApiDocEnabledEnv(): boolean {
  if (process.env.ENABLE_DOC) {
    if (isTestEnv()) {
      return false;
    }

    return true;
  }

  return false;
}
