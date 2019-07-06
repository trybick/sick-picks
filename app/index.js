const puppeteer = require('puppeteer');

const baseUrl = 'https://syntax.fm';

async function scrapeSickPicks() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  // Begin
  // const title = await page.evaluate(() => document.querySelectorAll('#-siiiiick-piiiicks- + ul li').textContent);
  // console.log('title', title);

  const textList = await page.evaluate(() => {
    const items = [...document.querySelectorAll('#-siiiiick-piiiicks- + ul li')];
    return items.map(i => i.textContent);
  });
  console.log('text items:', textList);

  const hrefList = await page.evaluate(() => {
    const links = [...document.querySelectorAll('#-siiiiick-piiiicks- + ul li a')];
    return links.map(a => a.href);
  });
  console.log('hrefs:', hrefList);


  browser.close();
}

scrapeSickPicks();