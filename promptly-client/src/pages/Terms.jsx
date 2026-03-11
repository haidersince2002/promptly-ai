import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Terms = () => {
  return (
    <div className="dark:bg-slate-900 min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-20 xl:px-32 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 5, 2026</p>

        <div className="space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Promptly AI ("the Service"), you agree to these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">2. Description of Service</h2>
            <p>Promptly AI is an AI-powered SaaS platform that provides the following tools:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Article generation using Google Gemini 2.5 Flash</li>
              <li>Blog title generation with AI suggestions</li>
              <li>AI image generation via ClipDrop API</li>
              <li>Background removal using Cloudinary AI</li>
              <li>Object removal using Cloudinary AI</li>
              <li>Resume review and analysis</li>
              <li>Prompt templates and prompt improvement</li>
              <li>Community gallery for sharing AI creations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">3. User Accounts</h2>
            <p>You must create an account via Clerk (Google sign-in or email) to use the Service. You are responsible for maintaining the security of your account credentials.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">4. Free & Premium Plans</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong className="dark:text-slate-300">Free Plan:</strong> 10 AI generations (articles + titles), basic dashboard, community gallery access, and limited prompt templates.</li>
              <li><strong className="dark:text-slate-300">Premium Plan (₹399/month):</strong> Unlimited generations, image generation, background/object removal, resume review, all templates, prompt improvement, and PDF export.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">5. Payments & Refunds</h2>
            <p>Premium payments are processed securely through <strong className="dark:text-slate-300">Razorpay</strong>. Supported methods include UPI, credit/debit cards, net banking, and wallets. Refund requests can be made within 7 days of purchase by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">6. Content Ownership</h2>
            <p>All AI-generated content (articles, images, titles) created through the Service belongs to you. You may use, modify, and distribute the generated content for personal or commercial purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">7. Prohibited Use</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Using the Service to generate harmful, illegal, or misleading content.</li>
              <li>Attempting to bypass plan limits or abuse API endpoints.</li>
              <li>Reverse-engineering or scraping the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">8. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties. We are not liable for any damages arising from the use of AI-generated content. AI outputs may contain inaccuracies — users should review generated content before publishing.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">9. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">10. Contact</h2>
            <p>Questions about these terms? Reach out via the <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
