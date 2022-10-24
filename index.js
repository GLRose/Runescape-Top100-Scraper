const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://secure.runescape.com/m=itemdb_oldschool/top100";
const fs = require("fs");
const express = require("express");
const app = express();

let PORT = process.env.PORT || 8080;
// Async function to scrape the data
async function scrapeData() {
  try {
    // Gets the HTML from our url
    const { data } = await axios.get(url);
    // Load htmls from our data to cheerio
    const $ = cheerio.load(data);
    //Items from our inspected element... this one is easy because it has a class
    const listItems = $(".table-item-link");
    //Item total trade count in past 7 days
    const tradeCountTotals = $("tbody tr");

    const items = [];
    const tradeCounts = [];

    //Grab each item element individually and put it into the items array
    listItems.each((idx, el) => {
      items[idx] = $(el).children("span").text();
    });
    //Grab each item element individually and put it into the tradeCounts array
    tradeCountTotals.each((idx, el) => {
      tradeCounts[idx] = $(el).children("td:last-child").text();
    });

    //Create a result object to join items[] and tradeCounts[] as one object
    const result = {};
    items.forEach((key, i) => (result[key] = tradeCounts[i]));
    console.log(result)

    //Routes
    app.get('/', function (req, res) {
      res.json(result)
    })
    //Write our data to a singular json file
    fs.writeFile("items.json", JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully written data to file");
    });
  } catch (err) {
    console.error(err);
  }
}
scrapeData();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});