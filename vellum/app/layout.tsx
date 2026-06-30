import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeProvider, themeBootScript } from "@/components/theme-provider";
import { LayoutModeProvider } from "@/components/layout-mode";
import { LAYOUT_COOKIE } from "@/lib/layout-cookie";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vellum — LLM documentation workspace",
  description:
    "Generate, analyze, and review documentation with an LLM. Frontend demo with mock data.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const saved = (await cookies()).get(LAYOUT_COOKIE)?.value;
  const initialLayout = saved === "split" ? "split" : "topnav";

  return (
    <html lang="en" data-theme="slate" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <LayoutModeProvider initial={initialLayout}>
            {children}
          </LayoutModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
