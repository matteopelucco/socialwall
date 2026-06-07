// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { EVENT_CONFIG } from "@/config/event";

export const metadata: Metadata = {
  title: EVENT_CONFIG.eventName,
  description: EVENT_CONFIG.eventSubtitle,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeVars = Object.entries(EVENT_CONFIG.theme)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

  return (
    <html lang="it">
      <head>
        <style>{`:root{${themeVars}}`}</style>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
