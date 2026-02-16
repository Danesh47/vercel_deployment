import AWS from "aws-sdk";

import * as fs from "fs";
import *  as path from "path";

const { S3 } = AWS;

const s3 = new S3({
    accessKeyId: "9657f399f7906a46755afd4471804c84",
    secretAccessKey:"f162d45fb54203b7c5c5466a8c10ce8d6149e099e675227fedb6a3e3dc16d0b4",
    endpoint:"https://0ef77f0bc2585bf6c6175546b075c059.r2.cloudflarestorage.com",
    s3ForcePathStyle:true,
    signatureVersion:"v4",

})

export async function downloadS3Folder(prefix = "") {

  if (prefix && !prefix.endsWith("/")) {
    prefix += "/";
  }

  const BASE_DIR = path.resolve(process.cwd(), "downloads");

  let continuationToken: string | undefined;
  let foundAny = false;

  do {
    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: "varcel",
      Prefix: prefix,
    };

    // ✅ add token only when defined
    if (continuationToken) {
      params.ContinuationToken = continuationToken;
    }

    const response = await s3.listObjectsV2(params).promise();

    continuationToken = response.NextContinuationToken;

    if (!response.Contents || response.Contents.length === 0) {
      continue;
    }

    foundAny = true;

    for (const obj of response.Contents) {
      const key = obj.Key;
      if (!key) continue;

      const localPath = path.join(BASE_DIR, key);
      fs.mkdirSync(path.dirname(localPath), { recursive: true });

      await new Promise<void>((resolve, reject) => {
        s3.getObject({ Bucket: "varcel", Key: key })
          .createReadStream()
          .pipe(fs.createWriteStream(localPath))
          .on("finish", resolve)
          .on("error", reject);
      });

      console.log("Downloaded:", key);
    }

  } while (continuationToken); // ✅ REQUIRED

  if (!foundAny) {
    console.log("⚠️ No objects found for prefix:", prefix);
  } else {
    console.log("✅ Download completed");
  }
}
