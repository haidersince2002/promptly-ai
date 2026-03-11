import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Privacy = () => {
  return (
    <div className="dark:bg-slate-900 min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-20 xl:px-32 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 5, 2026</p>

        <div className="space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">1. Information We Collect</h2>
            <p>When you use Promptly AI, we collect the following information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong className="dark:text-slate-300">Account Data:</strong> Name, email address, and profile picture provided through Clerk authentication (Google sign-in or email).</li>
              <li><strong className="dark:text-slate-300">Usage Data:</strong> AI-generated content (articles, titles, images), prompts submitted, and creation history stored in our database.</li>
              <li><strong className="dark:text-slate-300">Payment Data:</strong> Payment transactions are processed securely through Razorpay. We do not store your card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>To provide and maintain AI content generation services.</li>
              <li>To manage your account, track usage, and enforce plan limits (Free vs Premium).</li>
              <li>To process payments and manage subscriptions via Razorpay.</li>
              <li>To display your creations in the community gallery (only if you choose to share).</li>
              <li>To improve our AI tools and user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored on <strong className="dark:text-slate-300">Neon serverless PostgreSQL</strong> and secured using industry-standard practices. Authentication is handled by <strong className="dark:text-slate-300">Clerk</strong>, which provides encrypted session management. We use HTTPS for all communications.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong className="dark:text-slate-300">Clerk</strong> — Authentication and user management</li>
              <li><strong className="dark:text-slate-300">Google Gemini API</strong> — AI text generation</li>
              <li><strong className="dark:text-slate-300">ClipDrop API</strong> — AI image generation</li>
              <li><strong className="dark:text-slate-300">Cloudinary</strong> — Image processing (background/object removal)</li>
              <li><strong className="dark:text-slate-300">Razorpay</strong> — Payment processing</li>
              <li><strong className="dark:text-slate-300">Vercel</strong> — Application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">5. Your Rights</h2>
            <p>You may request to access, update, or delete your personal data at any time by contacting us. You can also delete your Clerk account directly, which will remove your authentication data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">6. Contact</h2>
            <p>For any privacy concerns, reach out to us via the <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
