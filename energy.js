'use strict';
const request = require('request-promise-native');
const util = require('util');
const parseString = require('xml2js').parseString;

const EXPIRY_DURATION = 30 * 60 * 1000;

// Source https://en.wikipedia.org/wiki/Life-cycle_greenhouse-gas_emissions_of_energy_sources#2014_IPCC.2C_Global_warming_potential_of_selected_electricity_sources
// and https://www.electricitymap.org/?page=country&solar=false&remote=true&wind=false&countryCode=FR
const emissionsPerEnergy = {
  'Nucléaire': 12,
  'Charbon': 820,
  'Gaz': 490,
  'Fioul': 205,
  'Hydraulique': 24,
  'Eolien': 11,
  'Solaire': 45,
};

const energyType = {
  'Nucléaire': 'low_carbon',
  'Charbon': 'fossil',
  'Gaz': 'fossil',
  'Fioul': 'fossil',
  'Hydraulique': 'renewable',
  'Eolien': 'renewable',
  'Solaire': 'renewable',
};


// For a given type of energy, what is the equivalent co2 amount?
function getEmissionsForEnergy(energy, valueMWh) {
  if (!emissionsPerEnergy[energy]) {
    return null;
  }

  let valueKWh = valueMWh * 1000;
  // From gram to ton
  // and from hour to minute
  return emissionsPerEnergy[energy] * valueKWh / 1000 / 1000 / 60;
}


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


let energyMix = [];
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
      let parsedContent = await util.promisify(parseString)(content, {explicitArray: false});
      energyMix = parsedContent.liste.mixtr.type
        .filter(energy => energy.$.granularite === 'Global')
        .map(energy => {
          let r = {
            name: energy.$.v,
            energyUnit: 'MW',
            energyValue: parseInt(energy.valeur[energy.valeur.length - 1]._),
            co2Unit: 'tCO2eq/minute',
          };
          r.co2Value = getEmissionsForEnergy(r.name, r.energyValue);
          r.type = energyType[r.name] || '?';
          return r;
        })
        .filter(energy => !isNaN(energy.energyValue));
    }
    catch (e) {
      console.log('Unable to download latest report.');
      console.log(e);
    }
  }
  return energyMix;
};
