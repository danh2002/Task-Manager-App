"use client";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import Sidebar from "../components/Sidebar/Sidebar";
import GlobalStyleProvider from "./GlobalStyleProvider";
import ContextProvider from "./ContextProvider";
import NextTopLoader from "nextjs-toploader";
import ThemeProvider from "./ThemeProvider";
import ChunkErrorHandler from "./ChunkErrorHandler";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
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
        <body>
          <NextTopLoader
            height={2}
            color="#27AE60"
            easing="cubic-bezier(0.53, 0.21, 0, 1)"
          />
          <ThemeProvider>
            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <SignedOut>
                <SignInButton />
                <SignUpButton>
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
            <ContextProvider>
              <GlobalStyleProvider>
                <SignedIn>
                  <Sidebar />
                </SignedIn>
                <div className="w-full">{children}</div>
              </GlobalStyleProvider>
            </ContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
