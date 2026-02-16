import { createClient } from "redis";
import { downloadS3Folder } from "./aws.js";

const subscriber = createClient();

subscriber.on("error", (err) => {
  console.error("Redis error:", err.message);
});

async function main() {
  await subscriber.connect();
  console.log("Redis connected");

  while (true) {
    const response = await subscriber.brPop("build-queue", 0);
    if (!response) continue;

    // ✅ Exact output like your screenshot
    console.log(response);

    const id = response.element;
    const path = "";
    console.log(path);
    await downloadS3Folder("");

  }
}

main();
