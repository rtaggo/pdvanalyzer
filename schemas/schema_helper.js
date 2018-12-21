'use strict'

const mysql = require('mysql');
const extend = require('lodash').assign;
// const config = require('../config');

const dbconfig = {
	"GCLOUD_PROJECT": "ggo-background",
	"MYSQL_USER": "root",
	"MYSQL_PASSWORD": "G@L1ge02018",
	"INSTANCE_CONNECTION_NAME": "ggo-background:europe-west2:ggobgpdvanalyzer"
};



/*
const options = {
  user: config.get('MYSQL_USER'),
  password: config.get('MYSQL_PASSWORD'),
  database: 'pdvanalyzerdb',
};
*/
const options = {
  user: 'root',
  password: 'G@L1ge02018',
  database: 'pdvanalyzerdb',
};
options.socketPath = `/cloudsql/${dbconfig['INSTANCE_CONNECTION_NAME']}`;

module.exports = {
  createSchema: createSchema
};


const prompt = require('prompt');
prompt.start();

console.log(
	`Running this script directly will allow you to initialize your mysql database.
	This script will not modify any existing tables.`
);

prompt.get(['user', 'password'], (err, result) => {
	if (err) {
		return;
	}
	createSchema(result);
});

function createSchema(config) {
	const connection = mysql.createConnection(
		extend(
		{
			multipleStatements: true,
		},
		config
		)
	);

	/*
	const queryString = 
		`USE \`${options.database}\`;
		CREATE TABLE IF NOT EXISTS \`${options.database}\`.\`jobs\` (
			\`messageid\` VARCHAR(255) NOT NULL,
			\`status\` VARCHAR(255) NULL,
			\`exectime\` INT,
		PRIMARY KEY (\`messageid\`));`;
	*/
	const queryString = 
		`USE \`${options.database}\`;
		CREATE TABLE IF NOT EXISTS \`${options.database}\`.\`analysis\` (
			\`messageid\` VARCHAR(255) NOT NULL,
			\`siret\` VARCHAR(255) NULL,
			\`s_lat\` DECIMAL(10,8),
			\`s_lng\` DECIMAL(10,8),
			\`g_lat\` DECIMAL(10,8),
			\`g_lng\` DECIMAL(10,8),
			\`distance\` DECIMAL(10,4));`;
	console.log(`Query: ${queryString}`);
	connection.query(
		queryString,
		err => {
		  if (err) {
		    throw err;
		  }
		  console.log('Successfully created schema');
		  connection.end();
		}
	);
}
