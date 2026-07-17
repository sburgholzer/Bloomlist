#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BloomlistStack } from '../lib/bloomlist-stack';

const app = new cdk.App();

const domainName = app.node.tryGetContext('domainName') as string;
const hostedZoneName = app.node.tryGetContext('hostedZoneName') as string;

new BloomlistStack(app, 'BloomlistStack', {
  domainName,
  hostedZoneName,
  // CloudFront + ACM certificate must be in us-east-1
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});
