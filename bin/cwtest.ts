#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CwtestStack } from '../lib/cwtest-stack';

const app = new cdk.App();
new CwtestStack(app, 'CwtestStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
