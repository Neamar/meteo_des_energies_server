'use strict';


function addNote(notes, energy, title, description) {
  notes.push({
    energy: energy,
    title: title,
    description: description
  });
}


module.exports = function getContextualTip(energyMix) { // , currentGauge
  let notes = [];

  let totalCarbonEmissions = energyMix.reduce((acc, energy) => acc + energy.co2Value || 0, 0);
  let totalEnergyProduced = energyMix.reduce((acc, energy) => acc + Math.max(0, energy.energyValue), 0);

  // Add notes that can be displayed at any time
  energyMix
    .filter(energy => energy.energyValue > 0 && energy.energyValue / totalEnergyProduced > 0.07)
    .forEach(energy => {
      let percentEnergy = Math.round(100 * energy.energyValue / totalEnergyProduced);
      let percentCarbon = Math.round(100 * energy.co2Value / totalCarbonEmissions);
      addNote(
        notes,
        energy,
        `${energy.name} : ${percentEnergy}% de la production`,
        percentCarbon > percentEnergy ? `Mais ${percentCarbon}% des émissions carbones !` : `Pour seulement ${percentCarbon}% des émissions carbones !`
      );
    });

  let note = notes[Math.floor(Math.random() * notes.length)];
  return note;
};
