import fs from 'fs';
import path from 'path';

const ignoreListPath = __dirname + '/../.ignore.json'
const ignoreList = JSON.parse(fs.existsSync(ignoreListPath) ? fs.readFileSync(ignoreListPath, 'utf-8') : '[]') as string[];

export const licensesDir = path.resolve(__dirname, '../../licenses');
export const dlGpl = async () => {
  const sym = (linkTarget: string, linkFrom: string) => {
    if (fs.existsSync(linkFrom)) fs.unlinkSync(linkFrom);
    const linkValue = path.relative(path.dirname(linkFrom), linkTarget);
    fs.symlinkSync(linkValue, linkFrom);
  }
  const handleDirLinks = (v: string): void => {
    // not a link guard
    if (fs.lstatSync(v).isSymbolicLink()) return;
    // is dir
    if (fs.lstatSync(v).isDirectory()) {
      // if it's a directory containing GPL in the name, link
      if (v.includes('GPL')) {
        sym(v, `${v}-OR-LATER`);
        sym(v, `${v}-ONLY`);
      }
      // recurse
      return fs.readdirSync(v).forEach(vv => handleDirLinks(path.join(v, vv)));
    }
    // doesnt contain GPL guard
    if (!fs.readFileSync(v).toString().includes('GNU General Public License'))
      return;
    // get base and ext
    const extName = path.extname(v);
    const baseName = path.basename(v, extName);
    const dir = path.dirname(v);
    // link <file-base>-OR-LATER.<ext> to <file-base>.<ext>
    sym(v, `${dir}/${baseName}-OR-LATER${extName}`);
    sym(v, `${dir}/${baseName}-ONLY${extName}`);
  };

  // download em
  const bases = [
    'https://www.gnu.org/licenses/',
    'https://www.gnu.org/old-licenses/',
  ];
  const licenses = [
    'gpl-3.0',
    'gpl-2.0',
    'gpl-1.0',
    'lgpl-3.0',
    'lgpl-2.1',
    'agpl-3.0',
    'fdl-1.3',
    'fdl-1.2',
    'fdl-1.1',
  ]
  const extensions = [
    '.txt',
    '.texi',
    '-standalone.html',
    '.xml',
    '.dbk',
    '.tex',
    '.md',
    '.odt',
    '.rtf',
    '.rst',
  ];

  // download
  for (const base of bases)
    for (const v of licenses) for (const vv of extensions) {
      const url = `${base}${v}${vv}`;
      const vFilename = v.toUpperCase();
      const dir = `${licensesDir}/${vFilename}`;
      const file = `${dir}/${vFilename}${vv.replace('-standalone', '')}`;

      if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
      if (!(fs.existsSync(file) || ignoreList.includes(url)) || process.argv.includes('--force')) {
        console.log('[FSF]', url, '->', file);
        const f = (await fetch(url));
        if (f.ok) {
          fs.writeFileSync(file, await f.text());
          if (ignoreList.includes(url))
            ignoreList.splice(ignoreList.indexOf(url), 1);
        }
        else if (f.status === 404 && !ignoreList.includes(url))
          ignoreList.push(url);
      }
    }

  // links
  fs.readdirSync(licensesDir).forEach(v => handleDirLinks(path.join(licensesDir, v)))

  // write ignore list
  fs.writeFileSync(ignoreListPath, JSON.stringify(ignoreList, null, 2));
}