'use strict';
const request = require('request-promise-native');
const util = require('util');
const parseString = require('xml2js').parseString;

const EXPIRY_DURATION = 30 * 60 * 1000;

function formatDate(date) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1; // January is 0!

  var yyyy = date.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  return `${dd}/${mm}/${yyyy}`;
}

let parsedContent;
let cachedAt = new Date(0);
module.exports = async function getLiveData() {
  let date = new Date();

  if (date - cachedAt > EXPIRY_DURATION) {
    cachedAt = date;
    let formattedDate = formatDate(date);
    let url = `https://www.rte-france.com/getEco2MixXml.php?type=mix&&dateDeb=${formattedDate}&dateFin=${formattedDate}&mode=NORM`;
    console.log('Refreshing data source');

    try {
      let content = await request(url);
      parsedContent = await util.promisify(parseString)(content, {explicitArray: false});
      console.dir(parsedContent);
    }
    catch (e) {
      console.log('Unable to download latest report.');
      console.log(e);
    }
  }
  return parsedContent;
};
