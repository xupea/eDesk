import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import webpackPaths from '../configs/webpack.paths';

const cmd1 = 'cmake .';

execSync(cmd1, {
  cwd: webpackPaths.nativePath,
  stdio: 'inherit',
});

const cmd2 = 'cmake --build . --config Release';

execSync(cmd2, {
  cwd: webpackPaths.nativePath,
  stdio: 'inherit',
});

const exeFile = process.platform === 'win32' ? 'robotjs.exe' : 'robotjs';

fs.copyFileSync(
  path.join(webpackPaths.nativePath, 'Release', exeFile),
  path.join(webpackPaths.rootPath, 'assets', exeFile)
);
