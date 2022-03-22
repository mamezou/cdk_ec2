import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export class CwtestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create new VPC
    const vpc = new ec2.Vpc(this, 'VPC');

    // use default VPC
    // const vpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true });

    // create new security group
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Security group for the test',
      securityGroupName: 'TestSecurityGroup',
    });

    // allow all traffic
    // securityGroup.connections.allowToAnyIpv4(ec2.Port.tcp(80));
    // securityGroup.connections.allowToAnyIpv4(ec2.Port.tcp(443));
    // securityGroup.connections.allowToAnyIpv4(ec2.Port.tcp(8080));

    // allow ssh access
    // securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH');

    // allow http access
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');

    // allow https access
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');

    // create new instance
    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(
        { generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }
      ),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup,

      // preinstalled software
      init: ec2.CloudFormationInit.fromConfigSets({
        configSets: {
          default: ['yumPreinstall'],
        },
        configs: {
          yumPreinstall: new ec2.InitConfig([
            ec2.InitPackage.yum('git'),
          ])
        }

      })
    });

    // create new cloudwatch metric
    const metric = new cloudwatch.Metric({
      namespace: 'AWS/EC2',
      metricName: 'CPUUtilization',
      period: Duration.minutes(5),
    });

    // add alarm
    // const alarm = new cloudwatch.Alarm(this, 'Alarm', {
    //   metric,
    //   threshold: 50,
    //   evaluationPeriods: 1,
    //   alarmDescription: 'Alarm when CPU is above 50%',
    //   actionsEnabled: true,
    //   alarmActions: [
    //     new cw_actions.SnsAction(this, 'SnsAction', {
    //       topic: new cw_actions.SnsTopic(this, 'SnsTopic', {
    //         displayName: 'AlarmTopic',
    //       }),
    //     }),
    //   ],
    // });


    // create new cloudwatch alarm
    // const alarm = new cloudwatch.Alarm(this, 'Alarm', {
    //   metric,
    //   threshold: 80,
    //   evaluationPeriods: 1,
    //   treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    // });

    // todo : add cpu alarm from cloudwatch to sns

    new CfnOutput(this, 'ec2-instance-id', {
      value: instance.instanceId,
    });

  }
}
