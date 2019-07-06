const puppeteer = require('puppeteer');

const baseUrl = 'https://syntax.fm';

async function scrapeSickPicks() {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null, devtools: false });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  const numberOfShows = (await page.$$('.show')).length;

  const scrapedData = [];
  for (let n = 1; n < numberOfShows; n++) {
    const textList = await page.evaluate(() => {
      const items = [...document.querySelectorAll('#-siiiiick-piiiicks- + ul li')];
      return items.map(i => i.textContent);
    });
    const hrefList = await page.evaluate(() => {
      const links = [...document.querySelectorAll('#-siiiiick-piiiicks- + ul li a')];
      return links.map(a => a.href);
    });
    scrapedData.push(textList, hrefList);
    await Promise.all([
      page.click(`#main > div.showList > div:nth-child(${n})`),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);
  }
  console.log('test', scrapedData);


  browser.close();
}

scrapeSickPicks();