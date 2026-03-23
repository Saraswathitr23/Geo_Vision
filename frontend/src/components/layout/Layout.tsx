import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-slate-950 transition-colors duration-300">

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-50
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar open={open} />
      </div>

      {/* Main Section */}
      <div className="flex flex-col flex-1 overflow-hidden">

        <Header onMenuClick={() => setOpen(true)} />

        <main
          className="
            flex-1 overflow-y-auto p-6
            bg-white dark:bg-slate-900
            text-gray-900 dark:text-white
            transition-colors duration-300
          "
        >
          {children}
        </main>

        <Footer />

      </div>
    </div>
  );
};

export default Layout;