// Source copied from:
// https://sst.dev/docs/start/cloudflare/worker

import { Resource } from "sst";

// Problem? I run `npx sst dev`, don't change anything, and then hit Ctrl+C. SST
// says "Cleaning up..." but the temporary resources created from the dev
// session (Worker and bucket) aren't deleted. Maybe this is intended behavior
// but confusing...
//
// I think this is intentional, I get my own "mpeterson" namespaced version of
// the app.

export default {
  async fetch(req: Request) {
    console.log("Hi SST!");
    if (req.method == "GET") {
      // Problem! TypeScript complains about my resource name until I run `npx
      // sst dev`.
      const first = await Resource.MaxBucketSST.list().then(
        (res) =>
          res.objects.toSorted(
            (a, b) => a.uploaded.getTime() - b.uploaded.getTime()
          )[0]
      );
      const result = await Resource.MaxBucketSST.get(first.key);
      return new Response(result.body, {
        headers: {
          "content-type": result.httpMetadata.contentType,
        },
      });
    }
    if (req.method == "PUT") {
      const key = crypto.randomUUID();
      await Resource.MaxBucketSST.put(key, req.body, {
        httpMetadata: {
          contentType: req.headers.get("content-type"),
        },
      });
      return new Response(`Object created with key: ${key}`);
    }
  },
};
