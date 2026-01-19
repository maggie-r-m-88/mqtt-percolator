import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono} from "next/font/google";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
   weight: ["400", "500", "600"], 
});

export const metadata: Metadata = {
  title: "MQTT Percolator",
  description: "A moka pot coffee maker simulator using MQTT protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${ibmMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
