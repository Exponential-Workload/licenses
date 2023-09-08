import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import { dlGpl, licensesDir as lDir } from './gpl';
import { basename, extname } from 'path';

(async () => {
  await dlGpl();

  const licensesObject = Object.fromEntries(readdirSync(lDir).filter(v => {
    const stat = statSync(lDir + '/' + v);
    return stat.isDirectory() && !stat.isSymbolicLink() && !v.includes('OR-LATER') && !v.includes('ONLY');
  }).map(v => [
    v,
    readdirSync(lDir + '/' + v).filter(v2 => !statSync(lDir + '/' + v + '/' + v2).isSymbolicLink() && !v2.includes('OR-LATER') && !v2.includes('ONLY')).map(v2 => [
      extname(v2).substring(1),
      v2,
      lDir + '/' + v,
      crypto.createHash('SHA512').update(v2).digest('hex'),
    ])
  ]));

  const hashesObj: Record<string, Record<string, string>> = {}
  const licensesObj: Record<string, Record<string, string>> = {}

  if (!existsSync(lDir + '/../hashed'))
    mkdirSync(lDir + '/../hashed');

  for (const [license, files] of Object.entries(licensesObject)) {
    hashesObj[license] = {};
    licensesObj[license] = {};
    for (const [ext, file, dir, hash] of files) {
      hashesObj[license][ext] = hash;
      const licenseText = readFileSync(dir + '/' + file);
      licensesObj[license][ext] = licenseText.toString();
      writeFileSync(lDir + '/../hashed/' + hash, licenseText);
    }
  }

  writeFileSync(lDir + '/../license-map.json', JSON.stringify(hashesObj, null, 2));
  writeFileSync(lDir + '/../licenses.json', JSON.stringify(licensesObj, null, 2));
})()
