import { Link } from "wouter";

const LAST_UPDATED = "April 22, 2026";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Draft notice */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3 text-center">
        <p className="text-amber-400 text-sm font-medium">
          DRAFT — Pending attorney review. This document is not yet a final legally binding agreement.
          Do not rely on it as legal advice. Review by qualified counsel is scheduled within 30 days of launch.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
            ← Back to Forgewright
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:text-muted-foreground [&_ul]:space-y-2 [&_li]:leading-relaxed">

          <section>
            <h2>1. Who We Are</h2>
            <p>
              Forgewright is a prompt engineering workbench operated by ASSESS LLC, a limited liability company
              organized under the laws of the State of Hawai'i, United States. This Privacy Policy describes how
              ASSESS LLC collects, uses, stores, and shares information when you use the Forgewright service
              ("Service"). For privacy inquiries, contact us at{" "}
              <a href="mailto:admin@forgewright.app" className="text-primary hover:underline">admin@forgewright.app</a>.
            </p>
          </section>

          <section>
            <h2>2. What Data We Collect and Why</h2>

            <p><strong className="text-foreground">Account data.</strong> When you sign in via Manus OAuth, we receive
            and store your email address, display name, and OAuth provider identifier. This is required to create and
            maintain your account and to associate your sessions and preferences with your identity.</p>

            <p><strong className="text-foreground">Session and content data.</strong> All prompts, scaffold blocks,
            session notes, outputs, diagnoses, comparison runs, swarm configurations, and other content you create
            within the Service ("User Content") are stored in our database (PostgreSQL, hosted on the Manus platform).
            This data is stored to provide the Service — specifically, to allow you to save, retrieve, and iterate on
            your work across sessions.</p>

            <p><strong className="text-foreground">Usage data.</strong> We track the number of Discovery sessions you
            create per calendar month. This data is used solely to enforce the Free tier session limit (10 sessions
            per month) and to determine your billing tier. We do not sell or share usage data with third parties for
            advertising or analytics purposes.</p>

            <p><strong className="text-foreground">Payment data.</strong> Subscription payments are processed by
            Stripe, Inc. ASSESS LLC does not see, store, or have access to your full payment card number, CVV, or
            expiration date. We store only the Stripe Customer ID and Stripe Subscription ID, which are opaque
            identifiers used to manage your subscription status.</p>

            <p><strong className="text-foreground">Encrypted API keys.</strong> If you choose to provide your own
            API keys for third-party LLM providers (Anthropic, OpenAI, Google), those keys are encrypted at rest
            using AES-256-GCM encryption before storage. They are never returned from the server in plaintext and
            are never logged. They are used solely to execute LLM requests on your behalf.</p>

            <p><strong className="text-foreground">Settings and preferences.</strong> Your saved preferences —
            including default model, tone preference, output format, and domain focus — are stored in your user
            profile to pre-populate the Service on subsequent sessions.</p>
          </section>

          <section>
            <h2>3. How We Use Your Data</h2>
            <p>We use the data we collect exclusively to:</p>
            <ul>
              <li>Provide, maintain, and improve the Service</li>
              <li>Authenticate your identity and maintain your session</li>
              <li>Enforce billing tier limits and process subscription payments</li>
              <li>Respond to your support requests and account inquiries</li>
              <li>Send transactional emails (account notifications, billing receipts) from a @forgewright.app address</li>
              <li>Comply with legal obligations where required</li>
            </ul>
            <p>
              We do not use your User Content to train machine learning models. We do not sell your data.
              We do not use your data for behavioral advertising.
            </p>
          </section>

          <section>
            <h2>4. Third-Party Services We Use</h2>
            <p>
              Operating the Service requires sharing certain data with the following third parties. Each is
              governed by their own privacy policy, linked below.
            </p>
            <ul>
              <li>
                <strong className="text-foreground">Stripe</strong> — payment processing. Stripe receives your
                payment card details and billing information directly.{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a>
              </li>
              <li>
                <strong className="text-foreground">Anthropic</strong> — LLM inference (default provider). Prompts
                you submit are transmitted to Anthropic's API for processing.{" "}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic Privacy Policy</a>
              </li>
              <li>
                <strong className="text-foreground">OpenAI</strong> — LLM inference (when selected or via BYOK).{" "}
                <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Privacy Policy</a>
              </li>
              <li>
                <strong className="text-foreground">Google</strong> — LLM inference (Gemini, when selected or via BYOK).{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a>
              </li>
              <li>
                <strong className="text-foreground">Manus</strong> — hosting platform. The Service runs on
                infrastructure provided by Manus. Your data is stored on Manus-managed servers.{" "}
                <a href="https://manus.im/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Manus Privacy Policy</a>
              </li>
            </ul>
            <p>
              For sensitive content, we recommend using Bring Your Own Key (BYOK) mode with a provider whose
              data retention and usage policies match your requirements. See our{" "}
              <Link href="/security" className="text-primary hover:underline">Security page</Link> for more detail.
            </p>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>
              Your data is retained for the lifetime of your account. When you delete your account via Settings,
              all User Content — including sessions, scaffolds, diagnoses, comparison runs, and account data —
              is permanently deleted from our systems within 30 days. This deletion is irreversible. You can
              export your data before deleting your account using the export functions in Settings.
            </p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the following rights with respect to your personal data:
            </p>
            <ul>
              <li><strong className="text-foreground">Access.</strong> You can view your account data and export all your sessions as JSON or Markdown ZIP from Settings at any time.</li>
              <li><strong className="text-foreground">Correction.</strong> You can update your display name and preferences in Settings.</li>
              <li><strong className="text-foreground">Deletion.</strong> You can delete your account and all associated data from Settings. You may also request deletion by emailing <a href="mailto:admin@forgewright.app" className="text-primary hover:underline">admin@forgewright.app</a>.</li>
              <li><strong className="text-foreground">Portability.</strong> You can export your data in JSON or Markdown format from Settings.</li>
              <li><strong className="text-foreground">GDPR rights (EU/EEA residents).</strong> You have the right to access, rectify, erase, restrict processing, and object to processing of your personal data. To exercise these rights, contact <a href="mailto:admin@forgewright.app" className="text-primary hover:underline">admin@forgewright.app</a>.</li>
              <li><strong className="text-foreground">CCPA rights (California residents).</strong> You have the right to know what personal information is collected, to delete it, and to opt out of its sale. We do not sell personal information.</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies and Tracking</h2>
            <p>
              Forgewright uses session cookies for authentication. These are secure, HTTPOnly, and SameSite=Lax
              cookies that allow you to remain signed in across page loads. We do not use third-party advertising
              cookies or tracking pixels.
            </p>
            <p>
              If we use a privacy-respecting analytics tool (such as Plausible Analytics), it will be noted here.
              Plausible does not use cookies, does not collect personal data, and does not track users across sites.
              No analytics data is shared with advertising networks.
            </p>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>
            <p>
              The Service is not directed to children under 13. We do not knowingly collect personal information
              from children under 13. If you believe a child under 13 has provided us with personal information,
              contact us at{" "}
              <a href="mailto:admin@forgewright.app" className="text-primary hover:underline">admin@forgewright.app</a>{" "}
              and we will delete it promptly. Users between 13 and 18 must have parental or guardian consent to
              use the Service.
            </p>
          </section>

          <section>
            <h2>9. Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your data, including
              AES-256-GCM encryption for API keys, TLS 1.2+ for all connections, HSTS enforcement, and secure
              session cookie configuration. For a full description of our security practices, see our{" "}
              <Link href="/security" className="text-primary hover:underline">Security page</Link>.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. For material changes, we will notify you via
              email at least 30 days before the changes take effect. Your continued use of the Service after the
              effective date constitutes acceptance of the updated policy. If you do not agree, you may delete
              your account before the effective date.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              For privacy inquiries, data access requests, or deletion requests, contact ASSESS LLC at:{" "}
              <a href="mailto:admin@forgewright.app" className="text-primary hover:underline">admin@forgewright.app</a>
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link href="/" className="hover:text-foreground transition-colors">← Back to Forgewright</Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground/60">
          Forgewright — by ASSESS LLC. Built on Moloka'i, Hawai'i. © 2026.
        </p>
      </div>
    </div>
  );
}
