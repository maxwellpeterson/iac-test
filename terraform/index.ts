// Source adapted from:
// https://sst.dev/docs/start/cloudflare/worker

import { DurableObject } from "cloudflare:workers";

export default {
  async fetch(req, env) {
    // Test proxying requests to Durable Objects.
    if (req.url.endsWith("/do")) {
      const id = env.DO.idFromName("test");
      const obj = env.DO.get(id);
      return obj.fetch(req);
    }
    // R2 starter code starts here...
    if (req.method == "GET") {
      const first = await env.BUCKET.list().then(
        (res) =>
          res.objects.toSorted(
            (a, b) => a.uploaded.getTime() - b.uploaded.getTime()
          )[0]
      );
      const result = await env.BUCKET.get(first.key);
      return new Response(result.body, {
        headers: {
          "content-type": result.httpMetadata.contentType,
        },
      });
    }
    if (req.method == "PUT") {
      const key = crypto.randomUUID();
      await env.BUCKET.put(key, req.body, {
        httpMetadata: {
          contentType: req.headers.get("content-type"),
        },
      });
      return new Response(`Object created with key: ${key}`);
    }
  },
} satisfies ExportedHandler<{ BUCKET: R2Bucket; DO: DurableObjectNamespace }>;

export class TestObject extends DurableObject {
  fetch(request: Request): Response | Promise<Response> {
    return new Response("Hello from Durable Object!");
  }
}
