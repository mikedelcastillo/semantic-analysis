const fs = require('fs');
const csv = require('csv-load-sync');
const xml = require('fast-xml-parser');

let data = [];

function add(string, positive, negative){
  string = string.replace(/[^a-z0-9\ ]/gmi, '').toLowerCase().trim();
  if(!string) return;
  let datum = [
    string,
    positive, negative];
  data.push(datum);
  console.log(datum);
}

false && (() => {
  fs.readFileSync('data/raw/positive-words.txt', 'utf-8')
  .trim().split('\n').forEach(word => {
    add(word.trim(), 1, 0);
  });

  fs.readFileSync('data/raw/negative-words.txt', 'utf-8')
  .trim().split('\n').forEach(word => {
    add(word.trim(), 0, 1);
  });
})();

(() => {
  csv("data/raw/twitter-airline-sentiment/Tweets.csv")
  .forEach(tweet => {
    if(!tweet.text) return;
    add(
      tweet.text.trim(),
      tweet.airline_sentiment == "positive" ? 1 : 0,
      tweet.airline_sentiment == "negative" ? 1 : 0
    );
  });
})();

(() => {
  csv("data/raw/Sentiment\ Analysis\ Dataset.csv")
  .forEach(row => {
    if(!row.SentimentText) return;
    add(
      row.SentimentText.trim(),
      row.Sentiment == "1" ? 1 : 0,
      row.Sentiment == "0" ? 1 : 0
    );
  });
})();

(() => {
  let strings = fs.readFileSync('data/raw/tweets/tweets_data.txt', 'utf-8').split("\n");
  let labels = fs.readFileSync('data/raw/tweets/tweets_label.txt', 'utf-8').split("\n");

  strings.forEach((string, i) => {
    add(
      string.trim(),
      labels[i].trim() == "N" ? 1 : 0,
      labels[i].trim() == "P" ? 1 : 0
    );
  });

})();

(() => {
  let rows = fs.readFileSync("data/raw/SentiWordNet_3.0.0_20130122.txt", 'utf-8').trim().split("\n");
  rows.forEach(row => {
    row = row.split('\t');
    add(
      row[5].trim(),
      Math.ceil(Number(row[2])),
      Math.ceil(Number(row[3])),
    );
  });
})();

(() => {
  let p = 'data/raw/sorted_data/';
  fs.readdirSync(p)
  .map(q => p + q)
  .filter(q => fs.lstatSync(q).isDirectory())
  .forEach(folder => {
    xml.parse(fs.readFileSync(folder + '/positive.review', 'utf-8'))
    .review.forEach(r => {
      if(!r.review_text) return;
      add(r.review_text, 1, 0);
    });

    xml.parse(fs.readFileSync(folder + '/negative.review', 'utf-8'))
    .review.forEach(r => {
      if(!r.review_text) return;
      add(r.review_text, 0, 1);
    });
  });
})();

(() => {
  let labels = {};
  let rawLabels = fs.readFileSync("data/raw/stanfordSentimentTreebank/sentiment_labels.txt", 'utf-8')
  .trim().split("\n");
  rawLabels.shift();
  rawLabels.forEach(s => {
    let split = s.split("|");
    labels[split[0].trim()] = Number(split[1]);
  });

  let strings = fs.readFileSync("data/raw/stanfordSentimentTreebank/dictionary.txt", 'utf-8')
  .trim().split("\n");
  strings.shift();
  strings.forEach(s => {
    let split = s.split("|");
    let text = split[0];
    let sentiment = labels[split[1].trim()];
    add(
      text,
      sentiment > 0.5 ? 1 : 0,
      sentiment < 0.5 ? 1 : 0,
    );
  });
})();

(() => {
  [
    [0, "data/raw/aclImdb/test/neg/"],
    [0, "data/raw/aclImdb/train/neg/"],
    [1, "data/raw/aclImdb/test/pos/"],
    [1, "data/raw/aclImdb/train/pos/"],
  ].forEach(set => {
    fs.readdirSync(set[1]).filter(f => f.match(/\.txt/gmi))
    .forEach(file => {
      let text = fs.readFileSync(set[1] + file, 'utf-8');
      add(
        text,
        set[0] == 1 ? 1 : 0,
        set[0] == 0 ? 1 : 0,
      );
    });
  });
})();

fs.writeFileSync("data/processed.json", JSON.stringify(data));
