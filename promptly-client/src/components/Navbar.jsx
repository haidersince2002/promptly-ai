import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/pricing", label: "Pricing" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="fixed z-50 w-full backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-800">
      <div className="flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
        <img
          src={assets.logo}
          alt="Promptly AI"
          className="w-32 sm:w-44 cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {user ? (
            <>
              <Link to="/ai" className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition">Dashboard</Link>
              <UserButton />
            </>
          ) : (
            <button
              onClick={openSignIn}
              className="hidden sm:flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-8 py-2.5 hover:bg-primary/90 transition"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-400"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenu && (
        <div className="md:hidden px-4 pb-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenu(false)}
              className="block py-3 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link to="/ai" onClick={() => setMobileMenu(false)} className="block py-3 text-sm text-primary font-medium">Dashboard</Link>
          ) : (
            <button
              onClick={() => { openSignIn(); setMobileMenu(false); }}
              className="w-full mt-2 text-sm bg-primary text-white py-2.5 rounded-lg cursor-pointer"
            >
              Get started
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
