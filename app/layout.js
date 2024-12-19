// [app/layout.js](app/layout.js)
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], // Specify all weights
  subsets: ['latin'],
  variable: '--font-inter', // Define a CSS variable for the font
  display: 'swap',
});

export const metadata = {
  title: "Reddit Gallery",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased  overflow-y-scroll overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}