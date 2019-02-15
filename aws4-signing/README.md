# AWS Signature 4 Request Signing

This script demonstrates how to access assets on AWS using the [Signature Version 4 Signing Process](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html). The script makes use of [aws4](https://github.com/mhart/aws4) to perform the request signing. This script demonstrates accessing s3, but this method can be used to access nearly all AWS services.

## Getting Started

### Install Dependencies

[Install yarn](https://yarnpkg.com/en/docs/install) if it is not already installed and run it from the root of the `aws4-signing` directory

```bash
yarn
```

### Enter Environment Variables

A `.env.example` file is included in this repository.

```
# AWS Access Key
ACCESS_KEY_ID=""

# AWS Secret
SECRET_ACCESS_KEY=""

# Region of bucket
REGION="us-east-2"

# Path to the requested asset
REQUEST_PATH="/edgeengine-test-bucket/pool.jpg"
```

Copy its contents to a `.env` file and fill in the values specific to your s3 instance. [See instructions](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) for obtaining `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY_ID`.
