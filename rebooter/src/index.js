const express = require('express');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const app = express();

app.post('/reboot', async () => {
  console.info('再起動します...');
  await execAsync('reboot');
});

app.listen(3000, '0.0.0.0', () => console.info('Expressサーバーでリクエストを待ち受けます...'));
