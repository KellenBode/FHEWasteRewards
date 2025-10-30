import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FHEVM Next.js Example - Fully Homomorphic Encryption',
  description: 'Complete Next.js 14 example demonstrating FHE encryption, decryption, and homomorphic computation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
