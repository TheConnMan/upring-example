const AWS = require('aws-sdk');
const dns = require('dns');

const sqs = new AWS.SQS({
  region: 'us-east-1'
});

const QUEUE_URL = process.env.QUEUE_URL;

dns.lookup('baseswim', (err, address) => {
  const upring = require('upring')({
    logLevel: 'trace',
    base: [`${address}:7799`],
    hashring: {
      joinTimeout: 5000,
      replicaPoints: 10
    }
  })

  upring.on('up', () => {
    console.log('Ready')
    getMessages();
  });
})

// getMessages();

async function getMessages() {
  console.log('Getting messages...');
  var messages = await sqs.receiveMessage({
    QueueUrl: QUEUE_URL,
    WaitTimeSeconds: 20,
    MaxNumberOfMessages: 10
  }).promise();
  if (messages.Messages) {
    await Promise.all(messages.Messages.map((message) => {
      return processMessage(message.Body);
    }));
    await deleteMessages(messages.Messages)
  }
  return getMessages();
}

async function processMessage(payload) {
  console.log(payload);
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });
}

async function deleteMessages(messages) {
  console.log('Deleting messages')
  return sqs.deleteMessageBatch({
    QueueUrl: QUEUE_URL,
    Entries: messages.map((message) => {
      return {
        Id: message.MessageId,
        ReceiptHandle: message.ReceiptHandle
      }
    })
  }).promise();
}
