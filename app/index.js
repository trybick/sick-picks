const puppeteer = require('puppeteer');

const baseUrl = 'https://syntax.fm';

async function scrapeSickPicks() {
  // Setup
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  // Begin
  const sick = await page.evaluate(() => document.querySelector('#-siiiiick-piiiicks-').textContent);
  console.log(sick);

  // Exit
  browser.close();
}

scrapeSickPicks();