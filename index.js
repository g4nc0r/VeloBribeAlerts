const express = require('express');
const bodyParser = require('body-parser');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
require('log-timestamp');

const externalBribeAddresses = require('./externalBribeAddresses.js').arr;

// env variables to be set via Replit
const webhookURL = process.env['TEST_URL'];
const port = process.env['PORT'];
// Discord webhook
const hook = new Webhook(webhookURL);

// init the Discord webhook attributes
hook.setUsername('VeloBribeAlerts');
const IMAGE_URL = 'https://pbs.twimg.com/profile_images/1527596755268911104/mlOr3ScH_400x400.jpg';
hook.setAvatar(IMAGE_URL);

// init app
const app = express();

// this application will receive JSON data
app.use(bodyParser.json());

// start the server on PORT
app.listen(port, () => console.log('\x1b[32m%s\x1b[0m', `[*] Running on port ${port}`));

// root GET for uptime pinging
app.get('/', (request, response) => {
  console.log('\x1b[34m%s\x1b[0m', '[~] GET request received');
  response.status(200).send();
});

// GET for testing
app.get('/test', (request, response) => {

  // test webhook
  const embed = new MessageBuilder()
    .setTitle('🚵‍♂️  **VELO/USDC Pool**')
    .setColor('#016962')
    .addField('**1 VELO**', `*TxHash: [0x123...84676a](https://optimistic.etherscan.io/tx/testhash})*`, true)
    .setThumbnail(IMAGE_URL)
    .setDescription('Bribe deposited')
    .setTimestamp();

  hook.send(embed).then(console.log('- Successfully sent webhook!'));
  response.status(200).send();
});

// POST for Alchemy webhook
app.post('/webhook', (request, response) => {
  
  console.log('\x1b[33m%s\x1b[0m', '[!] New bribe detected by Alchmey');
  console.log(request.body.event.activity[0]);
  const activity = request.body.event.activity[0];
  const bribeDepositAddress = (activity.toAddress).toLowerCase();

  // stop Alchemy from sending repeat POST requests
  response.status(200).send();

  // filter out 0 ETH replies that Alchemy sends
  if(activity.value != '0') {

    for (i=0; i < externalBribeAddresses.length; i++) {
      if ((externalBribeAddresses[i].address).toLowerCase() === bribeDepositAddress) {
        const txHash = String(activity.hash).substring(0, 4) + '...' + String(activity.hash).substring(60);  
        const pool = externalBribeAddresses[i].name;
    
        const embed = new MessageBuilder()
          .setTitle(`🚵‍♂️  **${pool} Pool**`)
          .setColor(externalBribeAddresses[i].color)
          .addField(`**${activity.value} ${activity.asset}**`, `*TxHash: [${txHash}](https://optimistic.etherscan.io/tx/${activity.hash})*`, true)
          .setThumbnail(IMAGE_URL)
          .setDescription('Bribe deposited')
          .setTimestamp();
    
        hook.send(embed).then(console.log('- Successfully sent to Discord'));
      }
    }
  }
});