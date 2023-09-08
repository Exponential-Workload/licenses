// exec nodemon --watch src --exec \"ts-node src/main.ts\" with args pushed

const { spawnSync } = require('child_process');
const args = process.argv.slice(2);

spawnSync('nodemon', [
  '--watch',
  'src',
  '--exec',
  'ts-node src/main.ts ' + args.join(' '),
], {
  stdio: 'inherit',
})
