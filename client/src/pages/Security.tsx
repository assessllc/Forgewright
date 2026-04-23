import { Link } from "wouter";
import { Shield, Lock, CreditCard, Database, Globe, Eye, Mail } from "lucide-react";

const LAST_UPDATED = "April 22, 2026";

interface SecurityCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SecurityCard({ icon, title, children }: SecurityCardProps) {
  return (
    <div className="border border-border rounded-lg p-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function Security() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
            ← Back to Forgewright
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Security</h1>
          </div>
          <p className="text-muted-foreground">
            This page describes how Forgewright handles your data and protects your account.
            It is a transparency document, not a legal agreement. For legal terms, see our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
          <p className="text-muted-foreground text-sm mt-3">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-5">

          <SecurityCard icon={<Lock className="h-5 w-5" />} title="Encryption at Rest">
            <p>
              User-provided API keys (Anthropic, OpenAI, Google) are encrypted using AES-256-GCM before being
              stored in the database. The encryption key is derived from the server's JWT secret and is never
              stored alongside the encrypted data. Encrypted keys are never returned from the server in plaintext
              and are never written to logs.
            </p>
            <p>
              Session data, scaffolds, and other User Content are stored in a managed PostgreSQL database on the
              Manus hosting platform. Database encryption at rest is provided by the underlying infrastructure.
            </p>
          </SecurityCard>

          <SecurityCard icon={<Globe className="h-5 w-5" />} title="Encryption in Transit">
            <p>
              All connections to Forgewright use TLS 1.2 or higher. The <code className="text-xs bg-muted px-1 py-0.5 rounded">.app</code> top-level
              domain enforces HSTS (HTTP Strict Transport Security) at the registry level, meaning browsers will
              always use HTTPS when connecting to forgewright.app — even on first visit. There is no HTTP fallback.
            </p>
          </SecurityCard>

          <SecurityCard icon={<Shield className="h-5 w-5" />} title="Authentication">
            <p>
              Forgewright uses Manus OAuth for authentication. We do not store passwords. Your credentials are
              managed entirely by Manus's OAuth infrastructure, which handles token issuance, refresh, and revocation.
            </p>
            <p>
              Session cookies are configured with <code className="text-xs bg-muted px-1 py-0.5 rounded">Secure</code>,{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">HttpOnly</code>, and{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">SameSite=Lax</code> flags. They cannot be
              accessed by client-side JavaScript and are not transmitted over unencrypted connections.
            </p>
          </SecurityCard>

          <SecurityCard icon={<CreditCard className="h-5 w-5" />} title="Payment Security">
            <p>
              All payment processing is handled by{" "}
              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe</a>,
              a PCI DSS Level 1 certified payment processor. Forgewright never sees, receives, or stores your
              full payment card number, CVV, or expiration date. Stripe handles card tokenization directly in
              the browser before any data reaches our servers.
            </p>
            <p>
              ASSESS LLC stores only the Stripe Customer ID and Stripe Subscription ID — opaque identifiers
              that allow us to manage your subscription status without access to your payment details.
            </p>
          </SecurityCard>

          <SecurityCard icon={<Database className="h-5 w-5" />} title="Data Handling and LLM Transit">
            <p>
              Prompts and outputs you create in Forgewright are stored in your account and associated with your
              user ID. They are not shared with other users. They are not used to train Forgewright's own models
              (Forgewright does not train models).
            </p>
            <p>
              When you run a prompt through the Service, it is transmitted to the configured LLM provider
              (Anthropic by default, or the provider matching your API key if you use BYOK mode). Each provider's
              own data retention and usage policies govern what they do with that content after transmission.
              Forgewright does not control those policies.
            </p>
            <p>
              <strong className="text-foreground">Recommendation for sensitive content:</strong> Use Bring Your
              Own Key (BYOK) mode with a provider whose API terms explicitly prohibit training on API inputs
              (Anthropic's API terms, for example, prohibit using API inputs to train models by default).
              Configure your key in Settings → API Keys.
            </p>
          </SecurityCard>

          <SecurityCard icon={<Eye className="h-5 w-5" />} title="Access Controls">
            <p>
              Access to production infrastructure and the database is restricted to ASSESS LLC personnel on a
              need-to-know basis. We do not grant third-party vendors access to user data except as described
              in our Privacy Policy (Stripe for payments, Manus for hosting, LLM providers for inference).
            </p>
            <p>
              All User Content is scoped to the authenticated user. No user can access another user's sessions,
              scaffolds, or account data through the Service's API.
            </p>
          </SecurityCard>

          <SecurityCard icon={<Mail className="h-5 w-5" />} title="Responsible Disclosure">
            <p>
              Security researchers are welcome to report vulnerabilities in Forgewright. If you discover a
              security issue, please report it to{" "}
              <a href="mailto:admin@forgewright.app" className="text-primary hover:underline">admin@forgewright.app</a>{" "}
              with a description of the vulnerability, steps to reproduce, and your assessment of impact.
            </p>
            <p>
              We apply a 90-day coordinated disclosure window: we ask that you give us 90 days to investigate
              and remediate before publishing details publicly. We will acknowledge receipt within 5 business days
              and keep you informed of our progress. Researchers who report valid, previously unknown
              vulnerabilities will be credited on this page (with your permission).
            </p>
            <p className="text-muted-foreground/60 text-xs">
              No vulnerability reports received to date.
            </p>
          </SecurityCard>

        </div>

        {/* What we don't do */}
        <div className="mt-10 border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">What we explicitly do not do</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              We do not store full payment card numbers, CVVs, or expiration dates.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              We do not return API keys from the server in plaintext after they are saved.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              We do not use your prompts or outputs to train machine learning models.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              We do not sell your data to third parties.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              We do not use third-party advertising trackers or behavioral analytics.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              We do not log raw webhook payloads or client secrets.
            </li>
          </ul>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
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
