const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://syntax.fm');

  const tagline = await page.evaluate(() => {
    const tag = document.querySelectorAll('h2.tagline').innerText;
    return tag;
  });

  console.log(tagline);
})();