import './globals.css';

export const metadata = {
  title: 'Anatomy60 — Learn the body, one day at a time',
  description: 'A focused, interactive 60-day human anatomy learning app.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
