/* eslint-disable prefer-destructuring */
const puppeteer = require('puppeteer');

const baseUrl = 'https://syntax.fm';

async function scrapeSickPicks() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    devtools: false,
  });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });

  const finalData = [];
  const numOfShows = (await page.$$('.show')).length;

  for (let n = 1; n < numOfShows; n++) {
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
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // Get episode number
    const episodeNum = await page.evaluate(
      n => document.querySelector(`#main > div.showList > div:nth-child(${n}) > a > p`).textContent,
      n,
    );

    // Set correct selector
    let sickPicksSelector = '#-siiiiick-piiiicks- + ul li';
    if ((await page.$(sickPicksSelector)) === null) {
      sickPicksSelector = '#sick-picks + ul li';
    } else if ((await page.$(sickPicksSelector)) === null) {
      sickPicksSelector = '#siiiiiiiick-pixxxx';
    }

    // Scrape text and links
    const textItems = await page.evaluate(sickPicksSelector => {
      const items = [...document.querySelectorAll(sickPicksSelector)];
      return items.map(i => i.textContent);
    }, sickPicksSelector);

    const links = await page.evaluate(sickPicksSelector => {
      const links = [...document.querySelectorAll(`${sickPicksSelector} a`)];
      return links.map(a => a.href);
    }, sickPicksSelector);

    const date = await page.evaluate(() => document.querySelector('.show__date').textContent);

    // Move data to object
    const sickPicksData = {};
    for (let i = 0; i < textItems.length; i++) {
      if (sickPicksData.hasOwnProperty(episodeNum)) {
        let owner = '';
        let text = textItems[i];
        // Most items have a ":" separating owner (Scott/Wes) from item text
        if (text.includes(':')) {
          owner = text.split(':')[0];
          text = text.split(':')[1].substr(2);
        }

        sickPicksData[episodeNum].push({
          iteration: n,
          link: links[i],
          owner,
          text,
          date,
        });
      } else {
        let owner = '';
        let text = textItems[i];
        if (text.includes(':')) {
          owner = text.split(':')[0];
          text = text.split(':')[1].substr(2);
        }

        sickPicksData[episodeNum] = [
          {
            iteration: n,
            link: links[i],
            owner,
            text,
            date,
          },
        ];
      }
    }

    finalData.push(sickPicksData);
  }

  console.log('Scraped data: ', JSON.stringify(finalData, null, 2));
  browser.close();
}

scrapeSickPicks()
