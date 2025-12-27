import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodjiFlo',
  description: 'Code review tool for power users of pull requests',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100 text-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
