const puppeteer = require('puppeteer');

const baseUrl = 'https://syntax.fm';

async function scraper() {
  // *** Setup ***
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(baseUrl);
  await page.waitFor(2000);

  // *** Test ***
  const tagline = await page.evaluate(() => document.querySelector('h2.tagline').textContent);
  console.log(tagline);

  // *** Begin ***


  browser.close();
}

scraper();