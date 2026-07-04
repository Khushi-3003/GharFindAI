import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digitomics AI - Property Discovery Agent',
  description: 'Autonomous Conversational Assistant for Home Buyers with multi-source ranking, commute estimates, and school analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
