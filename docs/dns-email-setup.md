# Forgewright — Email DNS Setup Guide

**Purpose:** This guide covers two tasks you need to complete in your Cloudflare dashboard and Resend account before transactional email is live for `forgewright.app`.

**Time required:** ~20 minutes total.

---

## Task 1: Add `no-reply@forgewright.app` alias in Cloudflare Email Routing

You already have `hello@`, `support@`, and `admin@` configured. Adding `no-reply@` takes about 2 minutes.

### Steps

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) and select the `forgewright.app` zone.
2. In the left sidebar, navigate to **Email** → **Email Routing**.
3. Click **Create address**.
4. Set **Custom address** to `no-reply`.
5. Set **Destination address** to whichever inbox you want to receive any accidental replies (e.g., `support@assessllc.com` or your personal Gmail).
6. Click **Save**.

Cloudflare will add the required MX and SPF records automatically for routing. No manual DNS entry needed for this step.

---

## Task 2: Set up Resend for transactional email sending

Resend is the recommended provider (used on your other app). This step enables the app to send emails from `no-reply@forgewright.app`.

### 2a. Add the domain in Resend

1. Log in to [Resend](https://resend.com) and go to **Domains** → **Add Domain**.
2. Enter `forgewright.app` and click **Add**.
3. Resend will display a set of DNS records to add. Keep this tab open.

### 2b. Add DNS records in Cloudflare

Go back to Cloudflare → `forgewright.app` zone → **DNS** → **Records**.

Add the following records exactly as shown in Resend's dashboard (values below are the standard Resend format — use the exact values Resend gives you, not these):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4G...` (Resend provides this) | Auto |
| TXT | `@` | `v=spf1 include:amazonses.com ~all` (Resend provides this) | Auto |
| CNAME | `em.` | `feedback-smtp.us-east-1.amazonses.com` (Resend provides this) | Auto |

> **Important:** Resend's dashboard shows the exact record values for your domain. Copy them precisely. The values above are illustrative only.

### 2c. Verify the domain in Resend

After adding the DNS records, return to Resend → **Domains** and click **Verify**. DNS propagation typically takes 5–30 minutes. Resend will show a green checkmark when verification is complete.

### 2d. Get your Resend API key

1. In Resend, go to **API Keys** → **Create API Key**.
2. Name it `forgewright-production`.
3. Set permission to **Sending access** only (not full access).
4. Copy the key — it starts with `re_`.

### 2e. Add the API key to Forgewright

In the Manus Management UI for the Forgewright project:
1. Open **Settings** → **Secrets**.
2. Add a new secret: `RESEND_API_KEY` = the key you copied.

Once that secret is set, the app's email sending code can be wired to use it. (This is the final step I will complete on my end once you confirm the key is added.)

---

## Email address roles (for reference)

| Address | Role | Used in |
|---------|------|---------|
| `no-reply@forgewright.app` | Transactional email sender (password resets, billing receipts, notifications) | App email sending |
| `support@forgewright.app` | Product help, bug reports, billing questions | /help, Settings page |
| `admin@forgewright.app` | Legal notices, privacy inquiries, responsible disclosure | /terms, /privacy, /security |
| `hello@forgewright.app` | General inquiries, press, partnerships | /contact page |

---

## After completing these steps

Once you have:
- [ ] Added `no-reply@forgewright.app` alias in Cloudflare Email Routing
- [ ] Added Resend DNS records in Cloudflare and verified the domain
- [ ] Added `RESEND_API_KEY` to Forgewright secrets

Let me know and I will wire the transactional email sending into the app (billing receipts, account deletion confirmation, etc.).

---

*Last updated: April 22, 2026*
