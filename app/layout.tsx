import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import Sidebar from "./components/Sidebar/Sidebar";
import GlobalStyleProvider from "./providers/GlobalStyleProvider";
import ContextProvider from "./providers/ContextProvider";
import ReminderNotification from "./components/Reminders/ReminderNotification";

import NextTopLoader from "nextjs-toploader";
import ThemeProvider from "./providers/ThemeProvider";
import ChunkErrorHandler from "./providers/ChunkErrorHandler";

const nunito = Nunito({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  process.env.CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    "Missing Clerk publishable key. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (or CLERK_PUBLISHABLE_KEY) in your deployment environment."
  );
}

export const metadata: Metadata = {
  title: "Task Manager App",
  description: "A task management application ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ChunkErrorHandler />
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
            integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </head>
        <body className={nunito.className}>
          <NextTopLoader
            height={2}
            color="#2b7fff"
            easing="cubic-bezier(0.53, 0.21, 0, 1)"
          />
          <ThemeProvider>
            <header
              style={{
                height: "64px",
                borderBottom: "1px solid var(--border-light)",
                background: "var(--header-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    color: "#2b7fff",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-grip"></i>
                </div>
                <span style={{ fontSize: "34px", lineHeight: 1, fontWeight: 800, color: "var(--text-primary)" }}>
                  TaskMaster
                </span>
                <nav style={{ display: "flex", gap: "6px", marginLeft: "20px" }}>
                  <button style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, borderBottom: "2px solid transparent", color: "var(--text-muted)" }}>Dashboard</button>
                  <button style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, borderBottom: "2px solid var(--primary-color)", color: "var(--primary-color)" }}>Projects</button>
                  <button style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, borderBottom: "2px solid transparent", color: "var(--text-muted)" }}>Calendar</button>
                  <button style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, borderBottom: "2px solid transparent", color: "var(--text-muted)" }}>Team</button>
                </nav>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--background-white)",
                  }}
                >
                  <i className="fa-regular fa-bell"></i>
                </button>
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
                <SignedIn>
                  <UserButton
                    afterSignOutUrl="/signin"
                    appearance={{
                      elements: {
                        avatarBox: {
                          width: "36px",
                          height: "36px",
                        },
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </header>

            <div style={{ display: "flex", height: "calc(100dvh - 64px)", background: "var(--body-bg)" }}>
              <ContextProvider>
                <GlobalStyleProvider>
                  <SignedIn>
                    <Sidebar />
                  </SignedIn>
                  <main
                    style={{
                      flex: 1,
                      overflow: "auto",
                      background: "var(--body-bg)",
                      padding: "20px 16px",
                    }}
                  >
                    {children}
                  </main>
                  <SignedIn>
                    <ReminderNotification />
                  </SignedIn>
                </GlobalStyleProvider>
              </ContextProvider>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
