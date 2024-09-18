// src/helpers/echoTitle.ts
import version from './version';
import figlet from 'figlet';

export default async function echoTitle(subtitle?: string) {
  const title = '';
  const sub = subtitle ? subtitle : '';
  console.log(figlet.textSync(`${title} ${sub}`));
  await version();
  console.log('');
}
