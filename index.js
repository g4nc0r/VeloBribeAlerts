const express = require('express');
const bodyParser = require('body-parser');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
require('log-timestamp');

const { externalBribeAddresses } = require('./externalBribeAddresses.js');

// Discord webhook
const WebhookURL = process.env['TEST_URL']
const hook = new Webhook(WebhookURL);

// init the Discord webhook attributes
hook.setUsername('VeloBribeAlerts');
const IMAGE_URL = 'https://pbs.twimg.com/profile_images/1527596755268911104/mlOr3ScH_400x400.jpg';
hook.setAvatar(IMAGE_URL);

// init app
const app = express();

// this application will receive JSON data
app.use(bodyParser.json());

// start the server on port 3100
app.listen(3100, () => console.log(`[*] Running on port 3100`));

// root GET for uptime pinging
app.get("/", (request, response) => {
  console.log("[~] GET request received");
  response.status(200).send();
});

// GET for testing
app.get("/test", (request, response) => {
  // test webhook
  const embed = new MessageBuilder()
  .setTitle('🚵‍♂️  **VELO/USDC Pool**')
  .setColor('#016962')
  .addField('**1 VELO**', `*TxHash: [0x123...84676a](https://optimistic.etherscan.io/tx/testhash})*`, true)
  .setThumbnail(IMAGE_URL)
  .setDescription('Bribe deposited')
  .setTimestamp();

  hook.send(embed).then(console.log("- Successfully sent webhook!"));
  response.status(200).send();
});

// POST for Alchemy webhook
app.post("/webhook", (request, response) => {
  console.log(`[!] NEW BRIBE DETECTED BY ALCHEMY`);
  console.log(request.body.event.activity[0]);
  const activity = request.body.event.activity[0];

  // stop Alchemy from sending repeat POST requests
  response.status(200).send();

  // filter out 0 ETH replies that Alchemy sends
  if(activity.value != '0') {

    if(externalBribeAddresses[activity.toAddress]) {

      const txHash = String(activity.hash).substring(0, 4) + "..." + String(activity.hash).substring(60);  
      const pool = externalBribeAddresses[activity.toAddress];
  
      const embed = new MessageBuilder()
        .setTitle(`🚵‍♂️  **${pool} Pool**`)
        .setColor('#016962')
        .addField(`**${activity.value} ${activity.asset}**`, `*TxHash: [${txHash}](https://optimistic.etherscan.io/tx/${activity.hash})*`, true)
        .setThumbnail(IMAGE_URL)
        .setDescription('Bribe deposited')
        .setTimestamp();
  
        hook.send(embed).then(console.log("- Successfully sent to Discord"));
    }
  }
});