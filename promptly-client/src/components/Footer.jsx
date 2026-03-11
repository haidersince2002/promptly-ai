import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-6 md:px-16 lg:px-24 xl:px-32 pt-12 mt-20 border-t border-gray-200 dark:border-slate-700">
      <div className="flex flex-col md:flex-row justify-between gap-12 pb-10 border-b border-gray-300 dark:border-slate-600">
        {/* Logo and Description */}
        <div className="max-w-md">
          <img src={assets.logo} alt="Promptly Logo" className="h-10" />
          <p className="mt-6 text-sm leading-relaxed">
            Experience the power of AI with <strong className="dark:text-slate-200">Promptly</strong>. Transform
            your content creation with our suite of premium AI tools. Write
            articles, generate images, and enhance your productivity like never
            before.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-16">
          <div>
            <h2 className="text-gray-900 dark:text-slate-200 font-semibold mb-4">Company</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-primary transition">Home</a></li>
              <li><a href="/about" className="hover:text-primary transition">About</a></li>
              <li><a href="/pricing" className="hover:text-primary transition">Pricing</a></li>
              <li><a href="/contact" className="hover:text-primary transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-slate-200 font-semibold mb-4">Legal</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-primary transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-xs md:text-sm mt-6 pb-6 text-gray-500 dark:text-gray-500">
        <p>
          &copy; 2025{" "}
          <a
            href="https://www.linkedin.com/in/haidersince2002/"
            className="hover:text-primary"
          >
            Haider Ali
          </a>
          . All rights reserved.
        </p>
        <p className="mt-1">
          GitHub:{" "}
          <a
            href="https://github.com/haidersince2002"
            className="hover:text-primary"
          >
            haidersince2002
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
