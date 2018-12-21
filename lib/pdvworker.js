'use strict'

const mysql = require('mysql');
const waterfall = require('async').waterfall;

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

function querySIRENEDB(sirets, cb){
	const res = [
		{ siret: '1', name: 'Darty', addr : '29 rue neuve tolbiac, 75013 PARIS'},
		{ siret: '2', name: 'Darty', addr : '8 AV DES TERNES, 75017 PARIS'},
		{ siret: '2', name: 'Darty', addr : 'RUE LINOIS, 75015 PARIS'}
	];
	cb(null, res);
};

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
 pdvanalysing: _pdvanalysing
};
