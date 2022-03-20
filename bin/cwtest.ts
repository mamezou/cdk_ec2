#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CwtestStack } from '../lib/cwtest-stack';

const app = new cdk.App();
new CwtestStack(app, 'CwtestStack');
