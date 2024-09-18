// src/helpers/version.ts
import { readFileAsync } from './fileUtils';
import log from './log';
import * as path from 'path';

export default async function version() {
  const packagePath = path.join(__dirname, '../../package.json');
  const packageFile = await readFileAsync(packagePath);
  const packageObj = JSON.parse(packageFile);
  const ver = packageObj.version;
  log.info('Version:', ver);
}
