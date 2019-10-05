/* eslint-disable prefer-destructuring */
const puppeteer = require('puppeteer');
const fs = require('fs');

const baseUrl = 'https://syntax.fm';

const saveDataToFile = data => {
  const path = `./data/sick-picks-${new Date().toJSON()}.json`;
  fs.writeFile(path, data, err => {
    if (err) throw err;
    console.log('The file was saved to:', path);
  });
};

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

    await Promise.all([
      page.click(nextShow),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    const epiNum = await page.evaluate(
      n => document.querySelector(`#main > div.showList > div:nth-child(${n}) > a > p`).textContent,
      n,
    );
    console.log('Scraping', epiNum)

    const date = await page.evaluate(() => document.querySelector('.show__date').textContent);

    // Previous shows use different IDs
    let sickPicksSelector = '#-siiiiick-piiiicks- + ul li';
    if ((await page.$(sickPicksSelector)) === null) {
      sickPicksSelector = '#sick-picks + ul li';
    } else if ((await page.$(sickPicksSelector)) === null) {
      sickPicksSelector = '#siiiiiiiick-pixxxx';
    }

    const textItems = await page.evaluate(sickPicksSelector => {
      const items = [...document.querySelectorAll(sickPicksSelector)];
      return items.map(i => i.textContent);
    }, sickPicksSelector);

    const links = await page.evaluate(sickPicksSelector => {
      const links = [...document.querySelectorAll(`${sickPicksSelector} a`)];
      return links.map(a => a.href);
    }, sickPicksSelector);

    const dataFromThisEpisode = {};
    for (let i = 0; i < textItems.length; i++) {
      // Most items have a ":" separating owner (Scott/Wes) from item text
      const splitOwnerFromText = requestedData => {
        let owner = '';
        let text = textItems[i];
        if (text.includes(':')) {
          owner = text.split(':')[0];
          text = text.split(':')[1].trim();
        }
        return requestedData === 'owner' ? owner : text;
      };

      if (dataFromThisEpisode.hasOwnProperty(epiNum)) {
        const owner = splitOwnerFromText('owner');
        const text = splitOwnerFromText('text');
        dataFromThisEpisode[epiNum].push({
          iteration: n,
          link: links[i],
          owner,
          text,
          date,
        });
      } else {
        const owner = splitOwnerFromText('owner');
        const text = splitOwnerFromText('text');
        dataFromThisEpisode[epiNum] = [
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

    finalData.push(dataFromThisEpisode);
  }

  const dataToSave = JSON.stringify(finalData, null, 2);
  console.log('Scraped data: ', dataToSave);
  saveDataToFile(dataToSave);

  browser.close();
}

scrapeSickPicks();
