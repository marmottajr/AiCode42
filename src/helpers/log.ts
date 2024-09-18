// src/helpers/log.ts
import chalk from 'chalk';

function commandInvalid(msg: string, exit = true) {
  console.error(`%s ${msg}`, chalk.redBright.bold('ERROR'));
  if (exit) {
    process.exit(1);
  }
}
function info(title: string, msg?: string | object) {
  msg = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
  console.log(`%s ${msg}`, chalk.blueBright.bold(title));
}
function success(title: string, msg: string | object) {
  msg = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
  console.log(`%s ${msg}`, chalk.greenBright.bold(title));
}
function error(msg: string) {
  console.log(`%s ${msg}`, chalk.redBright.bold('ERROR'));
}
function warning(title: string, msg: string) {
  console.log(`%s ${msg}`, chalk.yellowBright.bold(title));
}
export default { commandInvalid, info, success, error, warning };
