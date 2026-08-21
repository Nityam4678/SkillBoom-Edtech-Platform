# SkillBoom Deployment Runbook

This project is prepared for separate frontend and backend hosting. Replace every placeholder with provider-managed configuration; do not commit secret values.

## 1. MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a least-privilege application database user.
3. Restrict network access to the backend provider's egress addresses where practical.
4. Copy the Atlas connection string into the backend `MONGODB_URL` environment variable.
5. Confirm the database name and user permissions before starting the backend.

## 2. Backend Hosting

Use Render, Railway, or equivalent Node.js hosting.

- Root directory: `server`
- Install command: `npm ci`
- Start command: `npm start`
- Health endpoint: `/`
- Port: use the provider-provided `PORT`

Required backend variables:

- `NODE_ENV=production`
- `PORT` (provider supplied)
- `CLIENT_URL` (deployed frontend origin only)
- `MONGODB_URL`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN=15m`
- `REFRESH_TOKEN_EXPIRES_DAYS=7`
- `COOKIE_SAME_SITE=none` when frontend and backend are on different sites
- `COOKIE_SECURE=true`
- `CLOUD_NAME`
- `API_KEY`
- `API_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM=no-reply@skillboom.com` (the `skillboom.com` domain must be verified in Resend)
- `FOLDER_NAME`
- `RAZORPAY_KEY`
- `RAZORPAY_SECRET`

Do not place backend variables in the frontend hosting project.

## 3. Backend Verification

After deployment:

```text
GET https://<backend-host>/
```

Expected response status: `200`.

Then verify:

- MongoDB-backed course listing.
- Login and signup validation.
- Refresh cookie creation over HTTPS.
- Access-token refresh.
- Logout and refresh-cookie revocation.
- OTP and password-reset email delivery.
- Cloudinary upload.
- Razorpay test-mode order and verification.

## 4. Frontend Hosting

Use Vercel or equivalent static frontend hosting.

- Root directory: repository root
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `build`

Required frontend variables:

- `REACT_APP_API_URL=https://<backend-host>`
- `REACT_APP_RAZORPAY_KEY=<public-razorpay-key-id>`

The frontend must not receive `JWT_SECRET`, `MONGODB_URL`, `API_SECRET`, `RESEND_API_KEY`, or `RAZORPAY_SECRET`.

## 5. CORS and Cookies

Set backend `CLIENT_URL` to the exact frontend origin, including scheme and excluding a trailing path. The backend uses an allowlist and credentials; wildcard origins are not supported.

For separate Vercel and Render/Railway domains:

- `COOKIE_SAME_SITE=none`
- `COOKIE_SECURE=true`
- Both frontend and backend must use HTTPS.
- The frontend Axios client must send credentials.

For same-site deployment behind one parent domain, `lax` may be appropriate after browser verification.

## 6. Production Smoke Test

1. Open the deployed frontend.
2. Browse the course catalog and course details.
3. Create or use a test student account.
4. Log in and confirm the refresh cookie is HttpOnly and Secure.
5. Expire or replace the access token and confirm refresh succeeds.
6. Log out and confirm refresh no longer succeeds.
7. Test instructor and student authorization boundaries.
8. Run a Razorpay test payment.
9. Verify Cloudinary media upload.
10. Verify OTP and password-reset email delivery.
11. With a logged-in account, call `POST /api/v1/auth/test-email`; the email is sent only to that account's email address.
12. Confirm the browser console has no API/CORS errors.

## 7. Rollback

- Keep the previous frontend deployment available for instant rollback.
- Keep the previous backend release available.
- Revert backend and frontend environment variables together when API contracts change.
- Do not rotate secrets during a routine code rollback unless compromise is suspected.
- If a secret is suspected compromised, rotate it and invalidate active sessions immediately.

## 8. Current Limitation

No provider login, deployment project, production frontend URL, or production backend URL is configured in this workspace. Deployment must be performed after those provider details and secret values are supplied through provider secret management.
