# :mountain_bicyclist: VeloBribeAlerts - discord webhook

This project uses Alchemy Notify to monitor bribe contract addresses on Optimism and send an alert to Discord via a webhook when inbound bribes are detected.

### :gear: Run locally

* set `PORT` and `webhookURL` - designed to run on Replit, but can switch to `.env` or hardcoded for local.
* point Alchemy Notify webhook to addresses to monitor and Webhook URL (use `ngrok` if local).

```
$ cd ../VeloBribeAlerts
$ npm install
$ node index.js
```
