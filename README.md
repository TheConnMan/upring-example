# Upring Example Project

This is a small proof of concept for using [Upring](https://github.com/upringjs/upring) to consistently hash incoming messages within Kubernetes.

## Usage

### Setup

Clone, install, and build the project.

```
git clone https://github.com/TheConnMan/upring-example.git
cd upring-example/
yarn
docker build -t upring .
```

Create a FIFO SQS queue and use the queue URL below.

### Kubernetes

I used Docker for Windows with Kubernetes so all commands are run against a local Kubernetes node.

Add the appropriate environment variables in `upring.yml` (the LogDNA key is optional) then run:

```
kubectl create -f .\baseswim.yml
kubectl create -f .\upring.yml
```

### Publishing Messages

Finally, run `QUEUE_URL=<queue-url> node produce.js` to create messages for consumption. The Pod logs will show the messages consistently hashed throughout the cluster.

### Tear Down

```
kubectl delete -f .\upring.yml --grace-period=0 --force
kubectl delete -f .\baseswim.yml --grace-period=0 --force
```
