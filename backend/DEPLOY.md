# NeuroSync backend — deploy guide

Four Lambdas, each exposed via a Lambda Function URL. No API Gateway. No DynamoDB. The frontend already speaks this shape — just point its env vars at the URLs once they're live.

| Folder | Purpose | Calls Bedrock? | Frontend env var |
|---|---|---|---|
| `lambdas/recommend/` | Pick provider from free-text request | Yes | `VITE_RECOMMEND_URL` |
| `lambdas/schedule/` | Return Path A booking or Path B email draft | No | `VITE_SCHEDULE_URL` |
| `lambdas/register/` | Generate patient ID, echo profile | No | `VITE_REGISTER_URL` |
| `lambdas/rewrite/` | TBI-friendly message rewrite | Yes | `VITE_REWRITE_URL` |

---

## Per-Lambda setup (do this 4 times)

The steps are identical for every Lambda. Where they differ I've called it out.

### 1. Create the function

AWS Console → **Lambda** → **Create function** → **Author from scratch**.

- **Function name**: `neurosync-recommend` (or `-schedule`, `-register`, `-rewrite`)
- **Runtime**: **Node.js 22.x** (Node 20.x is fine too — both have AWS SDK v3 built-in)
- **Architecture**: x86_64 (default; arm64 also works)
- **Execution role**: **Use an existing role** → pick the role you already created (the one with Bedrock + S3 access).

Click **Create function**.

### 2. Paste the code

In the **Code** tab, open `index.mjs` and replace its entire contents with the file from this repo:

| Function name | Paste from |
|---|---|
| `neurosync-recommend` | `backend/lambdas/recommend/index.mjs` |
| `neurosync-schedule` | `backend/lambdas/schedule/index.mjs` |
| `neurosync-register` | `backend/lambdas/register/index.mjs` |
| `neurosync-rewrite` | `backend/lambdas/rewrite/index.mjs` |

Click **Deploy** (top-right of the editor).

### 3. Configuration → General

Configuration tab → **General configuration** → **Edit**.

- **Timeout**: `30 sec` for `recommend` and `rewrite` (Bedrock calls can take 5–15s). `10 sec` is fine for `schedule` and `register`.
- **Memory**: `256 MB` is plenty for all four.

Save.

### 4. Configuration → Environment variables

For **`neurosync-recommend`** and **`neurosync-rewrite`** (the Bedrock-backed Lambdas), add:

| Key | Value |
|---|---|
| `BEDROCK_MODEL_ID` | `us.anthropic.claude-haiku-4-5-20251001-v1:0` |

> The exact model ID depends on your region. If `us-west-2`, the `us.` cross-region inference profile above usually works. If you're elsewhere, open the **Bedrock console → Model access**, click into Haiku 4.5, and copy whichever model ID / inference profile ID your account is granted. Paste that here.

For **`neurosync-register`** (writes patient records to S3), add:

| Key | Value |
|---|---|
| `PATIENTS_BUCKET` | the name of your S3 bucket (just the name, not `s3://...`) |
| `BUCKET_REGION` | the region your bucket lives in (only needed if it differs from the Lambda's region) |

> If you omit `PATIENTS_BUCKET`, the register Lambda still works — it just skips the S3 write. Useful for testing without the bucket configured.

> **Bucket region matters.** If your bucket is in `us-east-1` but your Lambda runs in `us-west-2`, S3 returns a redirect error. Look up the bucket's region in the S3 console (under **Properties** → **AWS Region**) and set `BUCKET_REGION` to match. If the bucket is in the same region as the Lambda, you can leave `BUCKET_REGION` unset.

> `AWS_REGION` is set automatically by the Lambda runtime — don't add it yourself.

### 5. Configuration → Function URL

Configuration tab → **Function URL** → **Create function URL**.

- **Auth type**: **NONE** (public — fine for hackathon demo, **don't** ship this to prod as-is)
- **Configure CORS**: check the box, then:
  - **Allow origin**: `*` (or paste your S3 site URL once you have it — tighter for the demo, but `*` is easier)
  - **Allow methods**: `POST`, `OPTIONS`
  - **Allow headers**: `Content-Type`
  - **Max age**: `300`

Save. The console gives you a URL like `https://abc123xyz.lambda-url.us-west-2.on.aws/` — **copy it**. You'll need all four URLs for the frontend.

### 6. Test it from the Lambda console

**Test** tab → **Create new event** → name it `test`. Use the appropriate event body below. Click **Test**.

<details>
<summary>recommend test event</summary>

```json
{
  "requestContext": { "http": { "method": "POST" } },
  "body": "{\"patient\":{\"firstName\":\"Sam\"},\"request\":\"I've been having post-concussion headaches for three weeks\"}"
}
```

Expected response body: `{"providerId":"chen-neurology","reasoning":"..."}`
</details>

<details>
<summary>schedule test event</summary>

```json
{
  "requestContext": { "http": { "method": "POST" } },
  "body": "{\"clinicId\":\"chen-neurology\",\"appointmentType\":\"Neurology follow-up\",\"preferredTimeframe\":\"next 2 weeks\",\"patient\":{\"id\":\"patient-xyz\",\"firstName\":\"Sam\",\"lastName\":\"Lee\",\"email\":\"sam@example.com\"}}"
}
```

Expected response body: `{"path":"A","appointment":{...,"status":"scheduled","confirmationCode":"NS-2026-..."}}`
</details>

<details>
<summary>register test event</summary>

```json
{
  "requestContext": { "http": { "method": "POST" } },
  "body": "{\"firstName\":\"Sam\",\"lastName\":\"Lee\",\"email\":\"sam@example.com\"}"
}
```

Expected response body: `{"patientId":"patient-...","patient":{...,"id":"patient-..."}}`
</details>

<details>
<summary>rewrite test event</summary>

```json
{
  "requestContext": { "http": { "method": "POST" } },
  "body": "{\"rawMessage\":\"URGENT: Reschedule your appt ASAP, our system flagged a conflict with another patient and you need to act today.\",\"patient\":{}}"
}
```

Expected response body: `{"rewritten":"..."}`
</details>

If the test fails:
- **`AccessDeniedException` from Bedrock** → your Lambda's IAM role doesn't have `bedrock:InvokeModel` for the model ID you're using. Open IAM → role → edit policy.
- **`ValidationException: Invocation of model with ... is not supported`** → wrong model ID. Use the inference profile ID from Bedrock console.
- **Timeout** → bump the function timeout in step 3.

---

## Wire it to the frontend

Once you have all four function URLs, create `frontend/.env.local`:

```
VITE_USE_MOCKS=false
VITE_RECOMMEND_URL=https://YOUR-RECOMMEND-URL.lambda-url.us-west-2.on.aws/
VITE_SCHEDULE_URL=https://YOUR-SCHEDULE-URL.lambda-url.us-west-2.on.aws/
VITE_REGISTER_URL=https://YOUR-REGISTER-URL.lambda-url.us-west-2.on.aws/
VITE_REWRITE_URL=https://YOUR-REWRITE-URL.lambda-url.us-west-2.on.aws/
```

Then from `frontend/`:

```
npm run dev
```

`frontend/src/lib/api.js` already reads these env vars and falls back to mocks per-endpoint, so you can leave any URL unset (or set `VITE_USE_MOCKS=true`) to keep an endpoint on its mock during development.

You can also flip endpoints individually — e.g. set `VITE_RECOMMEND_URL` but leave the others unset to test only the Bedrock path live.

---

## Optional: host the frontend on S3

If you want the demo accessible without `npm run dev`:

1. From `frontend/`: `npm run build` → produces `frontend/dist/`.
2. S3 console → your bucket → **Properties** → **Static website hosting** → enable, index document `index.html`.
3. **Permissions** → **Block public access** → uncheck "Block all public access" (acknowledge the warning — this is the demo bucket).
4. **Permissions** → **Bucket policy** → paste a policy that allows `s3:GetObject` for `*` on `arn:aws:s3:::YOUR-BUCKET/*`.
5. Upload everything under `dist/` to the bucket root.
6. Your site URL is in the **Static website hosting** card — usually `http://YOUR-BUCKET.s3-website-REGION.amazonaws.com`.
7. **Tighten the Function URL CORS** — change **Allow origin** from `*` to that S3 site URL on each Lambda.

If the build needs the function URLs baked in, set the `VITE_*` env vars before running `npm run build` (Vite inlines them at build time).

---

## Troubleshooting cheat sheet

| Symptom | Likely cause |
|---|---|
| CORS error in browser console | Function URL CORS not configured, or `Allow origin` doesn't match the site origin. Re-check step 5. |
| `Access-Control-Allow-Origin contains multiple values '*, *'` | Lambda code is also emitting CORS headers — duplicate with Function URL config. The handlers in this repo deliberately don't set CORS headers (Function URL handles it). If you re-added them, remove them. |
| S3 `must be addressed using the specified endpoint` | The bucket lives in a different region than the Lambda. Set `BUCKET_REGION` on `neurosync-register` to match the bucket's actual region. |
| `Request failed` from `postJson` | Lambda returned non-2xx. Open CloudWatch Logs for that function. |
| Model returns prose instead of JSON | Sometimes Haiku wraps JSON in a fence. The `extractJson` helper in `recommend/index.mjs` already handles fenced JSON; if it still fails, check CloudWatch for the raw `text` printed by `console.error`. |
| 502 `BEDROCK_ERROR` with throttling message | Bedrock account-level rate limit. Wait or request an increase. |
| Patient registers but recommendation 502s | Check `BEDROCK_MODEL_ID` env var is set on `neurosync-recommend`. |
