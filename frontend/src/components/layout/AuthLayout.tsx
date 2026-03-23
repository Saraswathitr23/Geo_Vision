import type { ReactNode } from "react";
import AuthHeader from "./AuthHeader";
import Footer from "./Footer";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="
      min-h-screen flex flex-col
      bg-gray-100 dark:bg-slate-950
      transition-colors duration-300
    ">
      <AuthHeader />
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;