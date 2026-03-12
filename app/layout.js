import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://edmontonweekend.ca'),
  alternates: {
    canonical: '/',
  },
  title: "Things to do in Edmonton This Weekend | Concerts, Sports & Events",
  description: "Discover what's happening in Edmonton this weekend. Live concerts, Oilers games, festivals, and comedy nights. Your ultimate local event calendar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${jetBrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
