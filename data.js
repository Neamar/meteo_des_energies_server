'use strict';
const getEnergyMix = require('./energy-mix.js');
const getContextualTip = require('./tip.js');

const MAX_CARBON_EMISSIONS = 110;
const MIN_CARBON_EMISSIONS = 50;


module.exports = async(ctx) => {
  let energyMix = await getEnergyMix();
  // This value is in tCO2eq/min
  let carbonEmissions = energyMix.reduce((acc, energy) => acc + energy.co2Value || 0, 0);
  let currentGauge = Math.min(
    1,
    Math.max(
      0,
      (carbonEmissions - MIN_CARBON_EMISSIONS) / (MAX_CARBON_EMISSIONS - MIN_CARBON_EMISSIONS)
    )
  );

  let note = getContextualTip(energyMix, currentGauge);
  ctx.body = {
    carbonEmissions: carbonEmissions,
    currentGauge: currentGauge,
    energyMix: energyMix,
    note: note
  };
};
