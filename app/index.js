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

  for (let n = 1; n < numberOfShows; n++) {
    // Skip 'Hasty Treats'
    const nextShow = `#main > div.showList > div:nth-child(${n}) > a > h3`;
    const showTitle = await page.evaluate(
      (n, nextShow) => document.querySelector(nextShow).textContent,
      n,
      nextShow,
    );
    if (showTitle.includes('Hasty Treat')) {
      continue;
    }
    // Click next episode
    await Promise.all([
      page.click(nextShow),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    // Get episode number
    const episodeNum = await page.evaluate(
      n => document.querySelector(`#main > div.showList > div:nth-child(${n}) > a > p`).textContent,
      n,
    );
    // Get text content and links
    let sickPicksSelector = '#-siiiiick-piiiicks- + ul li';
    if (n < 44) {
      sickPicksSelector = '#sick-picks + ul li'
    }

    const textContents = await page.evaluate((sickPicksSelector) => {
      const items = [...document.querySelectorAll(sickPicksSelector)];
      return items.map(i => i.textContent);
    }, sickPicksSelector);
    const hyperlinks = await page.evaluate((sickPicksSelector) => {
      const links = [...document.querySelectorAll(`${sickPicksSelector} a`)];
      return links.map(a => a.href);
    }, sickPicksSelector);
    // Move to formatted array
    const formattedData = {};
    for (let i = 0; i < textContents.length; i++) {
      if (formattedData.hasOwnProperty(episodeNum)) {
        formattedData[episodeNum].push({
          iteration: n,
          episodeNum,
          textContent: textContents[i],
          hyperlink: hyperlinks[i],
        });
      } else {
        formattedData[episodeNum] = [
          {
            iteration: n,
            episodeNum,
            textContent: textContents[i],
            hyperlink: hyperlinks[i],
          },
        ];
      }
    }

    scrapedData.push(formattedData);
  }

  console.log('Final data: ', JSON.stringify(scrapedData, null, 2));

  browser.close();
}

scrapeSickPicks();
