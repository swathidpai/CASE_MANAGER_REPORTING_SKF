import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/Toast";
import { UnsavedChangesProvider } from "@/lib/useUnsavedChangesGuard";
import { IconRail } from "@/components/shell/IconRail";
import { TopBar } from "@/components/shell/TopBar";

export const metadata: Metadata = {
  title: "WindAI Reporting Matrix",
  description: "Condition-monitoring compliance reporting for WindAI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text-primary antialiased">
        <ToastProvider>
          <AppProvider>
            <UnsavedChangesProvider>
              <div className="flex h-screen w-screen overflow-hidden">
                <IconRail />
                <div className="flex min-w-0 flex-1 flex-col">
                  <TopBar />
                  <main className="min-w-0 flex-1 overflow-y-auto">
                    {children}
                  </main>
                </div>
              </div>
            </UnsavedChangesProvider>
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
