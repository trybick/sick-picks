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

  for (let n = 1; n < 5; n++) {
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

    // Push data
    scrapedData.push({ showTitle, textContent, hyperlinks });
  }
  console.log('data', scrapedData);

  // fs.readFile('data/data.json', 'utf8', (err, data) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     const file = JSON.parse(scrapedData);
  //     file.data.push({
  //       // show: showTitle,
  //       // text: textContent,
  //       // link: hyperlinks,
  //       test: '2',
  //     });

  //     const json = JSON.stringify(file);

  //     fs.writeFile('saved/data.json', json, 'utf8', err => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         // Everything went OK!
  //       }
  //     });
  //   }
  // });

  browser.close();
}

scrapeSickPicks();
