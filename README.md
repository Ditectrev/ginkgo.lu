# Pharmacie Ginkgo

French and English site for [Pharmacie Ginkgo](https://ginkgo.lu), rebuilt with Next.js (App Router) for Vercel. Page copy is taken from the live site.

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build
npm start
```

## Contact and prescription forms

Both forms post to this app:

- `POST /api/contact` — the form in the contact section (name, email, phone, message)
- `POST /api/prescription` — “Envoyez votre prescription” (details plus Jpeg, Jpg, Png or Pdf, 10 MB total)

Mail is sent with [Resend](https://resend.com) when these environment variables are set on Vercel (see `.env.example`):

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | yes, to send | Resend API key |
| `CONTACT_FROM` | yes, to send | Verified sender, for example `Pharmacie Ginkgo <pharmacie@ginkgo.lu>` |
| `CONTACT_TO` | no | Inbox. Defaults to `pharmacie@ginkgo.lu` |

The live WordPress site sends through Contact Form 7 and reCAPTCHA. Those server settings and the reCAPTCHA secret are not public, so this app does not call the old form endpoint. Until `RESEND_API_KEY` and `CONTACT_FROM` are set, a submission is not delivered and the page tells the visitor to email `pharmacie@ginkgo.lu` or call `+352 22 21 74`.

Vercel’s request body limit can reject prescription uploads near 4.5 MB even though the form still allows the 10 MB stated on the current site.

## Deploy

The project uses the Next.js framework defaults (`vercel.json`). Import the repository in Vercel and add the variables above. No deploy token is stored in this repository.
