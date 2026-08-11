import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Navbar title={title} />
        <main className="admin-content">
          <div className="content-container">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
