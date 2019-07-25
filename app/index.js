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
  const numberOfShows = (await page.$$('.show')).length;

  for (let n = 1; n < 5; n++) {
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
    const textContents = await page.evaluate(sickPicksSelector => {
      const items = [...document.querySelectorAll(sickPicksSelector)];
      return items.map(i => i.textContent);
    }, sickPicksSelector);

    const links = await page.evaluate(sickPicksSelector => {
      const links = [...document.querySelectorAll(`${sickPicksSelector} a`)];
      return links.map(a => a.href);
    }, sickPicksSelector);

    // Move data to object
    const formattedData = {};
    for (let i = 0; i < textContents.length; i++) {
      if (formattedData.hasOwnProperty(episodeNum)) {
        const owner = textContents[i].split(':')[0];
        const text = textContents[i].split(':')[1].substr(2);
        formattedData[episodeNum].push({
          iteration: n,
          link: links[i],
          owner,
          text,
        });
      } else {
        const owner = textContents[i].split(':')[0];
        const text = textContents[i].split(':')[1].substr(2);
        formattedData[episodeNum] = [
          {
            iteration: n,
            link: links[i],
            owner,
            text,
          },
        ];
      }
    }

    finalData.push(formattedData);
  }

  console.log('Scraped data: ', JSON.stringify(finalData, null, 2));
  browser.close();
}

scrapeSickPicks()
