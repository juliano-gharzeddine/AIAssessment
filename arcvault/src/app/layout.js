import "./globals.css";

export const metadata = {
  title: "ArcVault",
  description: "AI-powered intake and triage pipeline",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
