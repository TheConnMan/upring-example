const AWS = require('aws-sdk');
const winston = require('winston');

const QUEUE_URL = process.env.QUEUE_URL;

const sqs = new AWS.SQS({
  region: 'us-east-1'
});

module.exports = class Messaging {
  constructor(consumerFunction) {
    this.consumerFunction = consumerFunction;
  }

  async getMessages() {
    var messages = await sqs.receiveMessage({
      QueueUrl: QUEUE_URL,
      WaitTimeSeconds: 20,
      MaxNumberOfMessages: 10
    }).promise();
    if (messages.Messages) {
      try {
        await Promise.all(messages.Messages.map((message) => {
          return this.consumerFunction(message.Body);
        }));
        await this.deleteMessages(messages.Messages)
      } catch (e) {
        winston.error('Error consuming messages', e);
      }
    }
    return this.getMessages();
  }

  async deleteMessages(messages) {
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
}