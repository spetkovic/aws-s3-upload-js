import { readFile, uploadFileToS3 } from './utils.js';
import { dirname, join, resolve as _resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = _resolve(dirname(''));

const templates = [
    'standard',
    'large'
];

const distDir = './dist/local/';
const s3BucketDir = 'uploads';

function processUpload(awsCredentials) {
    console.log("\x1b[36m" + 'Deployment...' + "\x1b[0m");
    return new Promise((resolve, reject) => {

        let indexJsFilename = 'index.js';
        const indexJsFile = readFileSync(join(_resolve(__dirname), distDir + indexJsFilename), 'utf-8');

        let envBucket = awsCredentials.bucketStaging;

        if (process.argv[2] == 'p') {
            envBucket = awsCredentials.bucketProduction;
        }

        uploadFileToS3(awsCredentials, envBucket, `${s3BucketDir}/index.js`, indexJsFile, 'text/javascript')
          .then(resolve, reject);

  
        const argTemplates = process.argv.slice(3);

        argTemplates.forEach(argTemplate => {
            if(templates.includes(argTemplate)) {
                const templateFile = readFileSync(join(_resolve(__dirname), distDir + `templates/${argTemplate}-player.html`), 'utf-8');

                uploadFileToS3(awsCredentials, envBucket, `${s3BucketDir}/templates/${argTemplate}-player.html`, templateFile, 'text/html')
                  .then(resolve, reject);
            }
        });
    });
}

readFile('.aws.json').then(awsJson => {
    const awsCredentials = JSON.parse(awsJson);
    if (!awsCredentials.region) {
        awsCredentials.region = 'eu-central-1';
    }

    processUpload(awsCredentials);
});
