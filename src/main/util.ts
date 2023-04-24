/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function getParamsFromProtocol(rdcUrl: string) {
  const url = new URL(rdcUrl);

  const mid = url.searchParams.get('mid');
  const sid = url.searchParams.get('sid')?.replace('/', '');

  return { mid, sid };
}

export function gettParamsFromArgs() {
  const rdcUrl = process.argv.find((arg) => arg.includes('rdc://'));

  if (!rdcUrl) {
    return null;
  }

  return getParamsFromProtocol(rdcUrl);
}
