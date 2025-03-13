import { Providers } from './providers';
import './globals.css'; // Make sure this exists or remove if not needed

export const metadata = {
  title: 'Climb Grip',
  description: 'Your climbing application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
