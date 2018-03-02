const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const sqs = new AWS.SQS({
  region: 'us-east-1'
});

const QUEUE_URL = process.env.QUEUE_URL;
const count = parseInt(process.env.COUNT || '10');

Array.apply(null, Array(count)).reduce((promise, i) => {
  return promise.then(() => {
    const id = uuid();
    sqs.sendMessage({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({
        id
      }),
      MessageGroupId: id,
      MessageDeduplicationId: uuid()
    }).promise()
  });
}, Promise.resolve());
