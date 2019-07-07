/* eslint-disable no-unused-vars */

const testData = [
  {
    textContent: [
      'Scott:  Jelle’s Marble Runs',
      'Wes 1:  Good Quality Baking Sheet Pans',
      'Wes 2:  Pre-cut Parchment Paper Sheets',
    ],
    hyperlinks: [
      'https://www.youtube.com/channel/UCYJdpnjuSWVOLgGT9fIzL0g',
      'https://amzn.to/2FjrQVW',
      'https://amzn.to/2Dzli3F',
    ],
  },
];

const formattedSickPicks = [
  {
    show: '1',
    data: [
      {
        text: 'Scott:  Jelle’s Marble Runs',
        link: 'https://www.youtube.com/channel/UCYJdpnjuSWVOLgGT9fIzL0g',
      },
      {
        text: 'Wes 1:  Good Quality Baking Sheet Pans',
        link: 'https://amzn.to/2FjrQVW',
      },
    ],
  },
];

for (let i in firstObject) {
  formatted[i].data = original[i].textContent;
}

const newArray = [
  {
    show: i,
    data: [
      {
        text: textContents[t],
        link: hyperlinks[l],
      },
      {
        text: 'Wes 1:  Good Quality Baking Sheet Pans',
        link: 'https://amzn.to/2FjrQVW',
      },
    ],
  },
];


fs.readFile('data/data.json', 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  } else {
    const file = JSON.parse(scrapedData);
    file.data.push({
      // show: showTitle,
      // text: textContent,
      // link: hyperlinks,
      test: '2',
    });

    const json = JSON.stringify(file);

    fs.writeFile('saved/data.json', json, 'utf8', err => {
      if (err) {
        console.log(err);
      } else {
        // Everything went OK!
      }
    });
  }
});
