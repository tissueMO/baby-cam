const { chromium } = require('playwright');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

(async () => {
  // ブラウザーを初期化
  const browser = await chromium.launch();
  const context = await browser.newContext({
    locale: 'ja',
    viewport: { width: 1024, height: 576 },
  });
  const page = await context.newPage();

  // 配信ページにアクセス
  await page.goto(process.env.VIEWER_URL);
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // エラーが発生していたら配信されていないと判断してOS自体をリブートする
  const hasError = await page.waitForSelector('.js-error', {
    state: 'visible',
    timeout: 5000,
  });
  if (hasError) {
    console.info('配信エラーが発生しているため配信元マシンのOSを再起動します。');
    await execAsync('reboot');
  }
})();
