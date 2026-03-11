import { Mail, MessageSquare, MapPin, Github, Linkedin } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate send
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="dark:bg-slate-900 min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-20 xl:px-32">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white mb-4">
            Get in touch
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Have questions, feedback, or a collaboration idea? We'd love to hear from you.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6">
              Send us a message
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 p-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 outline-none focus:border-primary"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 p-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 outline-none focus:border-primary"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full mt-1 p-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 outline-none focus:border-primary resize-none"
                  placeholder="How can we help?"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition cursor-pointer"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6">
                Other ways to reach us
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-slate-700 dark:text-slate-200">Email</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      haider@promptlyai.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-slate-700 dark:text-slate-200">
                      Response Time
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-slate-700 dark:text-slate-200">Location</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Remote — Building globally
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-4">
                Connect with us
              </h3>
              <div className="flex gap-4">
                <a
                  href="https://github.com/haidersince2002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/haidersince2002/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
