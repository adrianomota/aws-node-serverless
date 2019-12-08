"use strict";

const AWS = require("aws-sdk");
const sharp = require("sharp");
const S3 = new AWS.S3();
const { basename, extname } = require("path");

module.exports.handle = async ({ Records: records }) => {
  try {
    await Promise.all(
      records.map(async record => {
        const { key } = record.s3.object;

        const image = await S3.getObject({
          Bucket: process.env.BUCKET,
          key: key
        }).promise();

        const optimized = await sharp(image.body)
          .resize(1280, 720, {
            fit: "inside",
            withoutEnlargement: true
          })
          .toFormat("jpeg", { progressive: true, quality: 50 })
          .toBuffer();

        await s3
          .putObject({
            Body: optimized,
            Bucket: process.env.BUCKET,
            ContentType: "image/jpeg",
            Key: `compressed/${basename(key, extname(key))}.jpg`
          })
          .promise();
      })
    );

    return {
      statusCode: 300,
      body: {}
    };
  } catch (err) {}
};
