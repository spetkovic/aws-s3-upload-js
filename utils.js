import { readFile as _readFile } from 'fs';
import { gzip } from 'zlib';
import pkg from 'aws-sdk';

const { S3 } = pkg;

export function uploadFileToS3(awsCredentials, bucket, key, file, contentType) {
    console.log(`Uploading to S3: ${bucket}/${key}`);
    const s3 = new S3(Object.assign({}, awsCredentials));
    return new Promise((resolve, reject) => {
        gzip(Buffer.from(file, 'utf-8'), (err, zipped) => {
        if (err) {
            reject(err);
        } else {
            s3.putObject({
                Key: key,
                Bucket: bucket,
                Body: zipped,
                ContentType: contentType,
                ContentEncoding: 'gzip',
                CacheControl: 'public,max-age=1800'
            }, (err, data) => {
                if (data) {
                    resolve(data.Location);
                    console.log('\x1b[42m\x1b[30m[Deployed]\x1b[0m ' + key);
                } else {
                    reject();
                }
            });
        }
        });
    });
}


export function readFile(path) {
    return new Promise((resolve, reject) => {
        _readFile(path, 'utf8', (err, contents) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(contents);
        });
    });
}