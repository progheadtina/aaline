# Aerotrace
Static pages in /public + serverless API in /api. No build step.

Env vars (Vercel > Settings > Environment Variables):
- ADMIN_PASSWORD  (any strong password)
- UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN  (auto-added if you connect Upstash Redis from the Vercel Marketplace; KV_REST_API_URL/TOKEN also work)

Pages: /  (lookup)   /admin.html  (admin)
