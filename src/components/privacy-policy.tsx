import { Shield } from 'lucide-react'

/** Shown with the policy and in its heading chip. Update whenever the text changes. */
export const PRIVACY_POLICY_UPDATED = 'September 22, 2026'

const h3 = 'mb-2 font-display text-base font-semibold text-white'
const term = 'text-white/90'
const link = 'text-rose-300 underline-offset-4 hover:underline'

/**
 * The DeDup privacy policy for the Android and iOS apps. Rendered by the /privacy page (the URL
 * the App Store and Google Play listings link to) and by the homepage Privacy modal.
 */
export function PrivacyPolicyContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/75">
      <section>
        <p>
          Rahul Pahuja (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) publishes the{' '}
          <strong className="text-white">DeDup</strong> apps for Android and iPhone. This policy
          explains what the apps access on your device, what they send off it, and why.
        </p>
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] p-4">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
          <p>
            <strong className="text-white">Local Processing Guarantee:</strong> Scanning, hashing,
            duplicate detection, photo labelling for search and contact matching all happen on your
            device. Your photos, videos, files, contacts and their names or metadata are never
            uploaded to us or to any third party.
          </p>
        </div>
      </section>

      <section>
        <h3 className={h3}>1. What the Apps Access on Your Device</h3>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className={term}>Photos and videos</strong> (both apps): to find duplicate,
            similar, blurry and large items and delete the ones you choose. On iPhone, deleted items
            go to the Photos app&rsquo;s Recently Deleted album.
          </li>
          <li>
            <strong className={term}>All files and media</strong> (Android, including{' '}
            <code>MANAGE_EXTERNAL_STORAGE</code>): to find duplicate documents, archives, audio and
            other files. File hashes are computed locally only.
          </li>
          <li>
            <strong className={term}>Contacts</strong> (both apps): to find duplicate contacts and
            merge the ones you choose.
          </li>
          <li>
            <strong className={term}>Microphone and speech recognition</strong> (both apps): only
            when you ask the storage assistant a question by voice. Recognition runs on-device where
            supported; otherwise Apple&rsquo;s or Google&rsquo;s speech service processes the audio
            under their privacy policies.
          </li>
          <li>
            <strong className={term}>Approximate location</strong> (Android): used on-device to
            work out sunrise and sunset for the automatic light/dark theme. It is not stored or
            sent anywhere.
          </li>
          <li>
            <strong className={term}>Notifications</strong> (both apps): to tell you when a scan
            finishes or storage is running low.
          </li>
        </ul>
      </section>

      <section>
        <h3 className={h3}>2. Data Sent Off Your Device</h3>
        <p className="mb-2">
          We use Google Firebase for the following. None of it is used to track you across other
          companies&rsquo; apps or websites.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className={term}>Account</strong> (Firebase Authentication): if you sign in with
            Google (Android and iPhone) or Apple (iPhone), your name, email address (or Apple&rsquo;s
            private relay address) and an account ID are stored so you stay signed in. You can use
            the scans as a guest without an account.
          </li>
          <li>
            <strong className={term}>Crash reports</strong> (Firebase Crashlytics): crash logs,
            device model and OS version, used to fix bugs.
          </li>
          <li>
            <strong className={term}>Usage analytics</strong> (Firebase Analytics): which screens and
            features are used, with an app-instance identifier, used to improve the apps.
          </li>
          <li>
            <strong className={term}>Bug reports and feature requests</strong> (Firebase Realtime
            Database): only when you send one, the text you write plus your account ID and, for bug
            reports, device model, OS version, app version and language.
          </li>
          <li>
            <strong className={term}>Notifications and in-app messages</strong> (Firebase Cloud
            Messaging, In-App Messaging and Remote Config): a push token if you allow notifications,
            plus occasional announcements and settings such as the minimum supported app version.
          </li>
          <li>
            <strong className={term}>App integrity</strong> (Android, Google Play Integrity): checks
            that the app and device are genuine.
          </li>
        </ul>
        <p className="mt-2">
          Google&rsquo;s handling of this data is described at{' '}
          <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className={link}>
            firebase.google.com/support/privacy
          </a>
          . The Android app also includes the Facebook Login SDK; Facebook sign-in is not currently
          offered, and no Facebook account data is collected.
        </p>
      </section>

      <section>
        <h3 className={h3}>3. What We Don&rsquo;t Do</h3>
        <p>DeDup shows no ads, uses no advertising identifiers, and never sells or shares your personal data.</p>
      </section>

      <section>
        <h3 className={h3}>4. Data Stored on Your Device</h3>
        <p>
          Scan results, history, the activity log, DeDup&rsquo;s Trash, search labels and your
          settings stay on your device and are removed when you uninstall the app. On Android they
          are kept in an encrypted database (SQLCipher); on iPhone they are protected by iOS Data
          Protection.
        </p>
      </section>

      <section>
        <h3 className={h3}>5. Account Deletion and Your Rights (GDPR &amp; DPDP)</h3>
        <p className="mb-2">
          You can delete your account at any time in the app: <strong className={term}>Settings &rsaquo;
          Account &rsaquo; Delete Account</strong>. This removes it from Firebase and, for Sign in with
          Apple, revokes DeDup&rsquo;s access. Depending on where you live you also have the right to:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className={term}>Access</strong> a copy of your personal data</li>
          <li><strong className={term}>Rectification</strong> of inaccurate data</li>
          <li><strong className={term}>Erasure</strong> (&ldquo;Right to be Forgotten&rdquo;), including bug reports you sent</li>
          <li><strong className={term}>Data Portability</strong> in a structured format</li>
          <li><strong className={term}>Withdraw Consent</strong>, for example by turning off notifications</li>
          <li><strong className={term}>Nominate</strong> someone to exercise these rights on your behalf (DPDP)</li>
        </ul>
      </section>

      <section>
        <h3 className={h3}>6. Children</h3>
        <p>DeDup is not directed at children under 13 and does not knowingly collect their personal data.</p>
      </section>

      <section>
        <h3 className={h3}>7. Changes</h3>
        <p>We update this page when the apps&rsquo; data practices change and revise the date above.</p>
      </section>

      <section>
        <h3 className={h3}>8. Contact &amp; Grievance Redressal</h3>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="font-semibold text-white">Data Protection / Grievance Officer</p>
          <p className="mt-1"><strong className={term}>Name:</strong> Rahul Pahuja</p>
          <p>
            <strong className={term}>Email:</strong>{' '}
            <a href="mailto:therahulpahuja@gmail.com" className={link}>therahulpahuja@gmail.com</a>
          </p>
          <p>
            <strong className={term}>Website:</strong>{' '}
            <a href="https://www.therahulpahuja.com" target="_blank" rel="noopener noreferrer" className={link}>
              www.therahulpahuja.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
