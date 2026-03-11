import { useAuth } from "@clerk/clerk-react";
import { BookTemplate, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [fetching, setFetching] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get("/api/templates", {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        if (data.success) setTemplates(data.templates);
      } catch (error) {
        toast.error(error.message);
      }
      setFetching(false);
    };
    fetchTemplates();
  }, []);

  const extractPlaceholders = (template) => {
    const matches = template.match(/\{(\w+)\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setContent("");
    const placeholders = extractPlaceholders(template.prompt_template);
    const defaultFields = {};
    placeholders.forEach((p) => (defaultFields[p] = ""));
    setFields(defaultFields);
  };

  const fillTemplate = () => {
    let filled = selectedTemplate.prompt_template;
    Object.entries(fields).forEach(([key, value]) => {
      filled = filled.replaceAll(`{${key}}`, value || `[${key}]`);
    });
    return filled;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const filledPrompt = fillTemplate();
      const { data } = await axios.post(
        "/api/templates/generate",
        { templateId: selectedTemplate.id, filledPrompt },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const categoryColors = {
    "Social Media": { from: "#3588F2", to: "#0BB0D7" },
    Business: { from: "#B153EA", to: "#E549A3" },
    "E-Commerce": { from: "#20C363", to: "#11B97E" },
    Communication: { from: "#F76C1C", to: "#F04A3C" },
    Content: { from: "#5C6AF1", to: "#427DF5" },
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="w-11 h-11 rounded-full border-3 border-purple-500 border-t-transparent animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll p-6">
      {!selectedTemplate ? (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BookTemplate className="w-7 h-7 text-primary" />
              <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
                Prompt Templates
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Choose a template, fill in the details, and generate AI content
              instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {templates.map((template) => {
              const colors = categoryColors[template.category] || {
                from: "#5044e5",
                to: "#7c3aed",
              };
              return (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className="p-6 max-w-xs rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <BookTemplate
                    className="w-12 h-12 p-3 text-white rounded-xl"
                    style={{
                      background: `linear-gradient(to bottom, ${colors.from}, ${colors.to})`,
                    }}
                  />
                  <h3 className="mt-4 mb-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                    {template.title}
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    {template.description}
                  </p>
                  <span className="inline-block mt-3 text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {template.category}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex items-start flex-wrap gap-4 text-slate-700 dark:text-slate-200">
          {/* Left col - Form */}
          <form
            onSubmit={onSubmitHandler}
            className="w-full max-w-lg p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedTemplate(null);
                setContent("");
              }}
              className="text-sm text-primary hover:underline mb-4 cursor-pointer"
            >
              ← Back to Templates
            </button>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 text-primary" />
              <h1 className="text-xl font-semibold">{selectedTemplate.title}</h1>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {selectedTemplate.description}
            </p>

            <div className="mt-6 space-y-4">
              {Object.keys(fields).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium capitalize">
                    {field.replace(/_/g, " ")}
                  </label>
                  {field === "original_email" || field === "description" ? (
                    <textarea
                      rows={3}
                      value={fields[field]}
                      onChange={(e) =>
                        setFields({ ...fields, [field]: e.target.value })
                      }
                      className="w-full p-2 px-3 mt-1 outline-none text-sm rounded-md border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                      placeholder={`Enter ${field.replace(/_/g, " ")}...`}
                      required
                    />
                  ) : (
                    <input
                      type="text"
                      value={fields[field]}
                      onChange={(e) =>
                        setFields({ ...fields, [field]: e.target.value })
                      }
                      className="w-full p-2 px-3 mt-1 outline-none text-sm rounded-md border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                      placeholder={`Enter ${field.replace(/_/g, " ")}...`}
                      required
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary to-[#7c3aed] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
              ) : (
                <Sparkles className="w-5" />
              )}
              Generate Content
            </button>
          </form>

          {/* Right col - Output */}
          <div className="w-full max-w-lg p-4 bg-white dark:bg-slate-800 rounded-lg flex flex-col border border-gray-200 dark:border-slate-700 min-h-96 max-h-[600px]">
            <div className="flex items-center gap-3">
              <BookTemplate className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Generated Content</h1>
            </div>

            {!content ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                  <BookTemplate className="w-9 h-9" />
                  <p>Fill the template and click "Generate Content" to get started</p>
                </div>
              </div>
            ) : (
              <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600 dark:text-slate-300">
                <div className="reset-tw">
                  <Markdown>{content}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
