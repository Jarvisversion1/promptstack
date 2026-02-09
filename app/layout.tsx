import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { ToastProvider } from "@/components/toast"

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://promptstack.dev"),
  title: {
    default: "PromptStack — Fork the Prompts Behind Real Projects",
    template: "%s | PromptStack",
  },
  description: "The open community where vibe coders share, fork, and remix the complete prompt workflows behind real software.",
  openGraph: {
    siteName: "PromptStack",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@promptstack",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} antialiased bg-[#09090b] text-[#e8e8ed]`}>
        <ToastProvider>
          <Nav />
          <main className="min-h-screen pt-14">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  )
}
