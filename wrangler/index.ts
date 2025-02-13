// Source adapted from:
// https://sst.dev/docs/start/cloudflare/worker

export default {
  async fetch(req, env) {
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
} satisfies ExportedHandler<Env>;
