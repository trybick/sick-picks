const puppeteer = require('puppeteer');
const fs = require('fs');

const baseUrl = 'https://syntax.fm';
const finalData = []

async function scrapeSickPicks() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    devtools: false,
  });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  const numberOfShows = (await page.$$('.show')).length;
  console.log('numberOfShows:', numberOfShows)

  for (let n = 1; n <= numberOfShows; n++) {
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
    // Get text and links
    // let sickPicksSelector = '#-siiiiick-piiiicks- + ul li';
    // if (n >= 118) {
    //   sickPicksSelector = '#sick-picks + ul li'
    // }
    // console.log('iteration + sickPicksSelector', n, sickPicksSelector)

    let sickPicksSelector = '#-siiiiick-piiiicks- + ul li';
    if (await page.$(sickPicksSelector) === null) {
      sickPicksSelector = '#sick-picks + ul li'
    }

    console.log('sickPicksSelector:', sickPicksSelector)
    // console.log('sickPickSelector222: ', JSON.stringify(sickPicksSelector, null, 2));

    const textContents = await page.evaluate((sickPicksSelector) => {
      const items = [...document.querySelectorAll(sickPicksSelector)];
      return items.map(i => i.textContent);
    }, sickPicksSelector);
    console.log('textContents:', textContents)

    const hyperlinks = await page.evaluate((sickPicksSelector) => {
      const links = [...document.querySelectorAll(`${sickPicksSelector} a`)];
      return links.map(a => a.href);
    }, sickPicksSelector);

    // Move data to object
    const formattedData = {};
    for (let i = 0; i < textContents.length; i++) {
      if (formattedData.hasOwnProperty(episodeNum)) {
        formattedData[episodeNum].push({
          iteration: n,
          textContent: textContents[i],
          hyperlink: hyperlinks[i],
        });
      } else {
        formattedData[episodeNum] = [
          {
            iteration: n,
            textContent: textContents[i],
            hyperlink: hyperlinks[i],
          },
        ];
      }
    }

    finalData.push(formattedData);
  }

  console.log('Scraped data: ', JSON.stringify(finalData, null, 2));

  browser.close();
}

scrapeSickPicks();
