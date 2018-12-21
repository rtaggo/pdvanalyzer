/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Buffer = require('safe-buffer').Buffer;

// [START functions_helloworld_http]
const escapeHtml = require('escape-html');

// [END functions_helloworld_http]

// [START functions_pdvanalyzer_pubsub]
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.pdvAnalyzerPubSub = (event, callback) => {
  const pubsubMessage = event.data;
  const pdvworker = require('./lib/pdvworker.js');

  if (!pubsubMessage.data) {
    callback(new Error('Message data is missing'));    
  }  
  const name = pubsubMessage.data
    ? Buffer.from(pubsubMessage.data, 'base64').toString('utf8')
    : 'World';

  const dataUtf8encoded = Buffer.from(pubsubMessage.data, 'base64').toString('utf8')
  var content;
  try {
    content = JSON.parse(dataUtf8encoded);
  } catch (ex) {
    console.warn('Failed to parse the data');
    callback(new Error('Failed to parse the data'));    
  }

  //console.log(`Hello, ${name}!`);  
  let context = event.context;
  console.log(`Context EventID: ${context.eventId}`);
  console.log(`sirets : ${content.sirets}`);
  pdvworker.pdvanalysing(context.eventId, content.sirets, res => {
    console.log('analysisResult : ' + JSON.parse(res));
  });
  callback();
//  const resulAnalysis = await pdvworker.pdvanalysing(context.eventId, content.sirets()
};
// [END functions_pdvanalyzer_pubsub]

/* eslint-enable no-throw-literal */

/* eslint-disable */

/* eslint-enable */
