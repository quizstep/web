import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://web.quizstep.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "QuizStep Academy",
  title: "QuizStep - Entrance Exam Preparation Platform",
  description: "Access focused, affordable question banks tailored for JEE, NEET, KEAM, and CUET entrance examinations.",
  icons: {
    icon: [
      { url: "/images/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
};

/**
 * JSON-LD structured data for Google to display the site name
 * as "QuizStep Academy" in search results instead of the domain.
 * @see https://developers.google.com/search/docs/appearance/site-names
 */
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "QuizStep Academy",
  alternateName: "QuizStep",
  url: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* WebSite structured data for Google site name display */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Inline script to prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}