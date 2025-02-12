/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "iac-test",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
    };
  },
  async run() {
    const bucket = new sst.cloudflare.Bucket("MaxBucketSST");
    
    const worker = new sst.cloudflare.Worker("MaxWorkerSST", {
      handler: "./index.sst.ts",
      link: [bucket],
      url: true,
    });

    return {
      api: worker.url,
    };
  },
});
