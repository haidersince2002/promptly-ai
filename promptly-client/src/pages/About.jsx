import { Brain, Code2, Lightbulb, Rocket, Users, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  const stats = [
    { label: "AI Tools", value: "6" },
    { label: "AI Models", value: "3" },
    { label: "Template Presets", value: "6" },
    { label: "Export Formats", value: "2" },
  ];

  const values = [
    {
      icon: Brain,
      title: "AI-First",
      description:
        "We leverage state-of-the-art AI models like Gemini 2.5 Flash and ClipDrop to deliver production-quality content generation.",
    },
    {
      icon: Zap,
      title: "Speed Matters",
      description:
        "Every millisecond counts. Our architecture is optimized for instant AI responses with serverless infrastructure.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Our community gallery lets creators share, discover, and get inspired by AI-generated content from peers.",
    },
    {
      icon: Code2,
      title: "Developer Friendly",
      description:
        "Built with React 19, Express 5, Tailwind CSS 4, and deployed on Vercel with Neon serverless Postgres.",
    },
    {
      icon: Lightbulb,
      title: "Continuous Innovation",
      description:
        "From prompt improvement to template systems, we're constantly building features that make AI accessible to everyone.",
    },
    {
      icon: Rocket,
      title: "Scale Ready",
      description:
        "Serverless from database to deployment. Our tech stack handles growth without breaking a sweat.",
    },
  ];

  return (
    <div className="dark:bg-slate-900 min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-20 xl:px-32">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white mb-6 leading-tight">
            We're building the future of
            <span className="text-primary"> AI content creation</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Promptly AI is a full-stack SaaS platform that brings 6 powerful AI tools
            together in one place — from article writing to image generation.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700"
            >
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-12">
            What drives us
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300"
              >
                <v.icon className="w-10 h-10 p-2 text-white rounded-lg bg-gradient-to-br from-primary to-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
            Built with modern tech
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "React 19",
              "Vite 7",
              "Tailwind CSS 4",
              "Node.js",
              "Express 5",
              "Neon PostgreSQL",
              "Clerk Auth",
              "Gemini 2.5 Flash",
              "ClipDrop API",
              "Cloudinary AI",
              "Vercel",
              "Razorpay",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
