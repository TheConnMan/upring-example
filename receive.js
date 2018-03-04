const dns = require('dns');
const Messaging = require('./Messaging');
const winston = require('winston');
const logdna = require('logdna-winston');

if (process.env.LOGDNA_KEY) {
  winston.add(winston.transports.Logdna, {
    key: process.env.LOGDNA_KEY,
    app: 'upring',
    index_meta: true
  });
}

dns.lookup('baseswim', (err, address) => {
  const upring = require('upring')({
    logLevel: 'info',
    base: [`${address}:7799`],
    hashring: {
      joinTimeout: 5000,
      replicaPoints: 10
    }
  })

  upring.on('up', () => { 
    new Messaging(async (payload) => {
      const json = JSON.parse(payload);
      const reply = await upring.requestp({
        key: json.id,
        number: json.number,
        node: upring.whoami()
      });
      winston.info(`Message with id ${json.id} number ${json.number} processed on node ${reply.node}`);
      return Promise.resolve();
    }).getMessages();
  });

  upring.on('request', async (req, reply) => {
    winston.info(`Incoming message with id ${req.key} number ${req.number} from node ${req.node} processed on ${upring.whoami()}`)
    await processMessage(req);
    reply(null, {
      node: upring.whoami()
    })
  });
});

async function processMessage(payload) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });
}