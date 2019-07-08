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
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);
    // Get episode number
    const episode = await page.evaluate(
      n => document.querySelector(`#main > div.showList > div:nth-child(${n}) > a > p`).textContent,
      n,
    );
    // Get text content and links
    const textContent = await page.evaluate(() => {
      const items = [...document.querySelectorAll('#-siiiiick-piiiicks- + ul li')];
      return items.map(i => i.textContent);
    });
    const hyperlinks = await page.evaluate(() => {
      const links = [...document.querySelectorAll('#-siiiiick-piiiicks- + ul li a')];
      return links.map(a => a.href);
    });
    // Move to formatted array
    const formatted = {};
    for (let i = 0; i < textContent.length; i++) {
      if (formatted.hasOwnProperty(episode)) {
        formatted[episode].push({
          iteration: n,
          episode,
          textContent: textContent[i],
          hyperlink: hyperlinks[i],
        });
      } else {
        formatted[episode] = [
          {
            iteration: n,
            episode,
            textContent: textContent[i],
            hyperlink: hyperlinks[i],
          },
        ];
      }


      // formatted.push({
      //   [episode]: [
      //     {
      //       iteration: n,
      //       episode,
      //       textContent: textContent[i],
      //       hyperlink: hyperlinks[i],
      //     },
      //   ],
      // });
    }

    scrapedData.push(formatted);
  }

  console.log('Finished data: ', JSON.stringify(scrapedData, null, 2));

  browser.close();
}

scrapeSickPicks();
