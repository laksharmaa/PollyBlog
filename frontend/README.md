# Narrate — organized frontend

The frontend is deliberately separated by responsibility:

```text
src/
├── assets/
├── components/
│   ├── auth/
│   ├── blog/
│   ├── common/
│   ├── editor/
│   ├── layout/
│   └── tts/
├── hooks/
├── pages/
├── routes/
├── services/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

- `pages/` contains route-level screens.
- `components/` contains reusable UI grouped by feature.
- `routes/` contains route definitions and protected-route logic.
- `services/` is the only API layer.
- `hooks/` contains application state hooks.
- `utils/` contains pure helpers/storage wrappers.
- `styles/` contains the global design system.

Set the backend URL in `.env`:

```env
VITE_API_BASE_URL=https://YOUR-API-GATEWAY-URL
```

Verified API contract:

- `POST /register`
- `POST /login`
- `POST /logout`
- `POST /verify-email`
- `POST /resend-verification`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /api/public-blogs`
- `GET /api/public-blog/:blogId`
- `POST /api/create-blog`
- `GET /api/get-blogs`
- `DELETE /api/delete-blog`
- `POST /api/speech`

Run with `npm install` then `npm run dev`.

Email delivery is configured on the backend with SAM parameters: `SmtpHost`,
`SmtpPort`, `SmtpSecure`, `SmtpUser`, `SmtpPassword`, `EmailFrom`, and
`FrontendUrl`. For Gmail SMTP, use an app password for `SmtpPassword`.
