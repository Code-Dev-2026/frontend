import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Camino Seguro Portal',
  description: 'Portal institucional del sistema Camino Seguro'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div style={{ position: 'relative', minHeight: '100vh' }}>{children}</div>
      </body>
    </html>
  );
}
