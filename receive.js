const dns = require('dns');
const Messaging = require('./Messaging');

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
        node: upring.whoami()
      });
      console.log(`Message processed on node ${reply.node}`);
    }).getMessages();
  });

  upring.on('request', async (req, reply) => {
    console.log(`Incoming message from node ${req.node} processed on ${upring.whoami()}`)
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