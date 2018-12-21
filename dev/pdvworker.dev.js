'use strict'
const pdvworker = require('../lib/pdvworker.js');

function doProcessSirets() {
	console.log('do process SIRET list');
	const sirets = '54208661601397,54208661600399,54208661601496';
	pdvworker.processSirets(sirets)
}

module.exports = {
  doProcessSirets: doProcessSirets
};

doProcessSirets();



