const fs = require('fs');

let data = JSON.parse(fs.readFileSync("data/processed.json", "utf-8"));

data = data.sort(() => Math.round(Math.random()) ? 1 : -1);

function naiveBayes(dataset, output){
  let frame = {
    text: [],
    positive: [],
    negative: [],
  };
  dataset.forEach(d => {
    frame.text.push(d[0]);
    frame.positive.push(d[1]);
    frame.negative.push(d[2]);
  });
  fs.writeFileSync(output, JSON.stringify(frame));
}

naiveBayes(data, 'data/naive-bayes-all.json');
naiveBayes(data.slice(0, 10000), 'data/naive-bayes-dev.json');
