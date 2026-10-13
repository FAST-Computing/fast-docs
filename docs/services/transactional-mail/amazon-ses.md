---
outline: deep
---

# Amazon SES — Sending from Python and JavaScript

## Project Configuration

- SES Region: `eu-north-1` (Europe, Stockholm)
- Verified domain: `fastcomputing.net`
- Example sender: `noreply@fastcomputing.net`
- Recommended API: Amazon SES v2

## Authentication

Do not put AWS credentials in the code or in the repository.

### Local Development

Set the environment variables:

```sh
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="eu-north-1"
```

On Windows PowerShell:

```powershell
$env:AWS_ACCESS_KEY_ID="..."
$env:AWS_SECRET_ACCESS_KEY="..."
$env:AWS_DEFAULT_REGION="eu-north-1"
```

### EC2

Attach an IAM role authorized to send with SES to the instance. Do not copy the local access keys onto the server: the SDKs automatically retrieve temporary credentials from the EC2 role.

Minimal IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "arn:aws:ses:eu-north-1:ACCOUNT_ID:identity/fastcomputing.net"
    }
  ]
}
```

Replace `ACCOUNT_ID` with the numeric ID of the AWS account.

If a configuration set is specified or applied during sending, also add its ARN to `Resource`, for example:

```
arn:aws:ses:eu-north-1:ACCOUNT_ID:configuration-set/CONFIGURATION_SET_NAME
```

## Python

Installation:

```sh
pip install boto3
```

Sending:

```python
import boto3

ses = boto3.client("sesv2", region_name="eu-north-1")

response = ses.send_email(
    FromEmailAddress="Fast Computing <noreply@fastcomputing.net>",
    Destination={
        "ToAddresses": ["recipient@example.com"],
    },
    ReplyToAddresses=["nicola.demo@fastcomputing.net"],
    Content={
        "Simple": {
            "Subject": {
                "Data": "Test email",
                "Charset": "UTF-8",
            },
            "Body": {
                "Text": {
                    "Data": "This email was sent via Amazon SES.",
                    "Charset": "UTF-8",
                },
                "Html": {
                    "Data": (
                        "<h1>Test email</h1>"
                        "<p>This email was sent via Amazon SES.</p>"
                    ),
                    "Charset": "UTF-8",
                },
            },
        }
    },
)

print("Email sent:", response["MessageId"])
```

If Botocore reports that the login provider dependency is missing:

```sh
pip install "botocore[crt]"
```

## JavaScript / Node.js

Installation:

```sh
npm install @aws-sdk/client-sesv2
```

Sending:

```js
import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({
  region: "eu-north-1",
});

const response = await ses.send(new SendEmailCommand({
  FromEmailAddress: "Fast Computing <noreply@fastcomputing.net>",
  Destination: {
    ToAddresses: ["recipient@example.com"],
  },
  ReplyToAddresses: ["nicola.demo@fastcomputing.net"],
  Content: {
    Simple: {
      Subject: {
        Data: "Test email",
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: "This email was sent via Amazon SES.",
          Charset: "UTF-8",
        },
        Html: {
          Data: `
            <h1>Test email</h1>
            <p>This email was sent via Amazon SES.</p>
          `,
          Charset: "UTF-8",
        },
      },
    },
  },
}));

console.log("Email sent:", response.MessageId);
```

To use `import`, add the following to `package.json`:

```json
{
  "type": "module"
}
```

## Notes

- The sender must belong to the verified domain.
- The region in the code and in the IAM policy must be `eu-north-1`.
- Do not pass `ConfigurationSetName` unless it is necessary.
- Store and monitor the `MessageId` returned by SES.
- Handle bounces and complaints separately before increasing volumes.
