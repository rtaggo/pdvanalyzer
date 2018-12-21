'use strict'

const mysql = require('mysql');
const waterfall = require('async').waterfall;
//const request = require('request');
const fetch = require('node-fetch');
const request = require("request-promise");

const turf = require('@turf/turf');

const dbconfig = {
	"GCLOUD_PROJECT": "ggo-background",
	"MYSQL_USER": "root",
	"MYSQL_PASSWORD": "G@L1ge02018",
	"INSTANCE_CONNECTION_NAME": "ggo-background:europe-west1:ggobgpdvanalyzer",
	"DATABASE_NAME": "pdvanalyzerdb"
};

const placesconfig = {
	"GOOGLE_PLACES_APIKEY" : "AIzaSyD6OIl1mS-ag4N3_OIfkzddZ2rUhOtyJAI"
};

const options = {
  user: dbconfig.MYSQL_USER,
  password: dbconfig.MYSQL_PASSWORD,
  database: dbconfig.DATABASE_NAME,
};


/**
 * TODO(developer): specify SQL connection details
const connectionName = process.env.INSTANCE_CONNECTION_NAME || '<YOUR INSTANCE CONNECTION NAME>';
const dbUser = process.env.SQL_USER || '<YOUR DB USER>';
const dbPassword = process.env.SQL_PASSWORD || '<YOUR DB PASSWORD>';
const dbName = process.env.SQL_NAME || '<YOUR DB NAME>';
 */

/*
const mysqlConfig = {
  connectionLimit: 1,
  user: dbconfig.MYSQL_USER,
  password: dbconfig.MYSQL_PASSWORD,
  database: dbconfig.DATABASE_NAME,
};
*/

if ( process.env.NODE_ENV === 'production') {
	options.socketPath = `/cloudsql/${dbconfig['INSTANCE_CONNECTION_NAME']}`;
}

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.

function getPDVInfosInSIRENE(sirets, cb){
	console.log('[PDVWORKER] >> getPDVInfosInSIRENE');
	const res = [
		{ siret: '54208661601397', name: 'Darty', addr : '29 rue neuve tolbiac, 75013 PARIS', lat: 48.830635, lng : 2.376956},
		{ siret: '54208661600399', name: 'Darty', addr : '8 AV DES TERNES, 75017 PARIS', lat: 48.878345, lng: 2.296267},
		{ siret: '54208661601496', name: 'Darty', addr : 'RUE LINOIS, 75015 PARIS', lat: 48.847916, lng: 2.283699}
	];
	cb(null, res);
}

async function doRequest(url) {
	const response = await fetch(url);
	const json = await response.json();
	console.log(`JSON : ${JSON.stringify(json)}`);
	return json;
	/*
	request(url).then(function(res){
		return res;
	});
	*/
}

const queryGPlace = async (url) => {
	let res = await request(url);
	return res;
}

const doSearchGPlaces = async (sirets, cb) => {
	let results = [];
	for (let s in sirets) {
		let siret = sirets[s];
		var url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(siret.name + ' ' + siret.addr)}&inputtype=textquery&fields=name,geometry,formatted_address&key=AIzaSyD6OIl1mS-ag4N3_OIfkzddZ2rUhOtyJAI`;
		let res = await queryGPlace(url);
		let json = JSON.parse(res);
		console.log(`Response for ${siret.name}: ${JSON.stringify(json)}`);
		if (Array.isArray(json.candidates) && json.candidates.length > 0) {
			let addr = json.candidates[0];
			let glat = addr.geometry.location.lat;
			let glng = addr.geometry.location.lng;
			let distance = turf.distance(turf.point([siret.lat, siret.lng]), turf.point([glat, glng]), {units: 'kilometers'});
			siret['g_lat'] = glat;
			siret['g_lng'] = glng;
			siret['distance'] = distance;
			siret['found'] = true;
		} else {
			siret['found'] = false;
		}
		results.push(siret);
	}
	cb (null, results);
}

function searchGooglePlacesAPI(sirets, cb) {
	console.log('[PDVWORKER] >> searchGooglePlacesAPI');
	/*
	const promises = sirets.map(async siret => {
		var url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(siret.name + ' ' + siret.addr)}&inputtype=textquery&fields=name,geometry,formatted_address&key=AIzaSyD6OIl1mS-ag4N3_OIfkzddZ2rUhOtyJAI`;
		let json = doRequest(url);
		console.log(`Response for ${siret.name}: ${JSON.stringify(json)}`);

		return json;
	});
	*/
	/*	
	const results =  sirets.map(async siret => {
		var url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(siret.name + ' ' + siret.addr)}&inputtype=textquery&fields=name,geometry,formatted_address&key=AIzaSyD6OIl1mS-ag4N3_OIfkzddZ2rUhOtyJAI`;
		let json = doRequest(url);
		console.log(`Response for ${siret.name}: ${JSON.stringify(json)}`);

		return json;
	});
	*/
	/*
	let results = [];
	for (var s in sirets) {
		var siret = sirets[s];
		var url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(siret.name + ' ' + siret.addr)}&inputtype=textquery&fields=name,geometry,formatted_address&key=AIzaSyD6OIl1mS-ag4N3_OIfkzddZ2rUhOtyJAI`;
		try  {
			const json = await doRequest(url);
			console.log(`Response for ${siret.name}: ${JSON.stringify(json)}`);
		} catch (error) {
			console.log('GPLACES API Error: ', error);
		}
	}

	cb(null, results);
	*/
	doSearchGPlaces(sirets, cb);
}

/*
function searchGooglePlacesAPI_Old(sirets, cb) {
	console.log('[PDVWORKER] >> searchGooglePlacesAPI');
	for (var s in sirets) {
		var siret = sirets[s];
		var url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(siret.name + ' ' + siret.addr)}&inputtype=textquery&fields=name,geometry,formatted_address&key=AIzaSyD6OIl1mS-ag4N3_OIfkzddZ2rUhOtyJAI`;
		try  {
			const json = doRequest(url);
			console.log(`Response for ${siret.name}: ${JSON.stringify(json)}`);
		} catch (error) {
			console.log('GPLACES API Error: ', error);
		}
	}
	cb(null, sirets);
}
*/

function processSirets(sirets, callback) {
	console.log('[PDVWORKER] >> processSirets');
	const siretsArr = sirets.split(',');
	waterfall([
		(cb) => {
			getPDVInfosInSIRENE(siretsArr, cb);
		},
		searchGooglePlacesAPI
	], (err, results) => {
		if (err) {
			console.log(`ERROR: ${err}`);
			if (callback) {
				callback(err);
			}
			return;
		}
		console.log(`ALl done!!! results: ${JSON.stringify(results)}`);
		if (callback) {
			callback();
		}
	});
}

function _pdvanalysing(messageid, sirets,callback) {
	const connection = mysql.createConnection(options);
	
	let updateJob = `UPDATE jobs SET status='running' WHERE messageid='${messageid}'`;

	connection.query(updateJob, (err, res) => {
		if (err) {
			console.error(`Failed to update the job ${messageid} to 'running'. ${err}`);
			//callback({status: 'failed', message: `Failed to update the job ${messageid} to 'running'`,  error: err});
			return {status: 'failed', message: `Failed to update the job ${messageid} to 'running'`,  error: err};
		}
		console.log(`Job ${messageid} updated to running.....`);
		console.log(`TODO: Google places API search for all`);

		updateJob = `UPDATE jobs SET status='done' WHERE messageid='${messageid}'`;
		connection.query(updateJob, (err, res) => {
			if (err) {
				console.error(`Failed to update the job ${messageid} to 'done'. ${err}`);
				//callback({status: 'failed', message: `Failed to update the job ${messageid} to 'done'`,  error: err});
				return {status: 'failed', message: `Failed to update the job ${messageid} to 'done'`,  error: err};
			}
			console.log(`Job ${messageid} updated to done.....`);
			//callback({status: 'completed', message: `Job ${messageid} done.`});
			return {status: 'completed', message: `Job ${messageid} done.`};
		});
	});
};

module.exports = {
 pdvanalysing: _pdvanalysing,
 processSirets: processSirets
};
