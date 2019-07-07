const puppeteer = require('puppeteer');
const fs = require('fs');

const baseUrl = 'https://syntax.fm';

async function scrapeSickPicks() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    devtools: false,
  });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  const numberOfShows = (await page.$$('.show')).length;
  const scrapedData = [];

  for (let n = 1; n < 6; n++) {
    // Click next show
    await Promise.all([
      page.click(`#main > div.showList > div:nth-child(${n})`),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);
    // Don't include Hasty Treats
    const showTitle = await page.evaluate(
      () => document.querySelector('#main > div.showNotes > h2').textContent,
    );
    if (showTitle.includes('Hasty Treat')) {
      continue;
    }
    // Copy text
    const textContent = await page.evaluate(() => {
      const items = [...document.querySelectorAll('#-siiiiick-piiiicks- + ul li')];
      return items.map(i => i.textContent);
    });
    // Copy embedded links
    const hyperlinks = await page.evaluate(() => {
      const links = [...document.querySelectorAll('#-siiiiick-piiiicks- + ul li a')];
      return links.map(a => a.href);
    });
    // Move to formatted array
    const formatted = [];
    for (let i = 0; i < textContent.length; i++) {
      formatted.push({
        data: [
          {
            iteration: n,
            textContent: textContent[i],
            hyperlink: hyperlinks[i],
          },
        ],
      });
    }
    scrapedData.push(formatted);
  }

  console.log('data', JSON.stringify(scrapedData, null, 4));

  browser.close();
}

scrapeSickPicks();
