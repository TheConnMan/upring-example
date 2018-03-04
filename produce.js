const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const sqs = new AWS.SQS({
  region: 'us-east-1'
});

const QUEUE_URL = process.env.QUEUE_URL;
const ids = parseInt(process.env.IDS || '10');
const count = parseInt(process.env.COUNT || '10');

Array(ids).fill().reduce((promise1) => {
  const id = uuid();
  return promise1.then(() => {
    return Array(count).fill().reduce((promise2, i, number) => {
      return promise2.then(() => {
        sqs.sendMessage({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify({
            id,
            number
          }),
          MessageGroupId: id,
          MessageDeduplicationId: id + number
        }).promise()
      });
    }, Promise.resolve());
  });
}, Promise.resolve());
