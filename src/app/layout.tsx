import { Providers } from './providers';
import './globals.css';
import { NavigationDock } from './components/NavigationDock';

export const metadata = {
  title: 'Climb Grip',
  description: 'Your climbing application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="emerald">
      <body>
        <Providers>
          <div className="min-h-screen pb-16">{children}</div>
          <NavigationDock />
        </Providers>
      </body>
    </html>
  );
}
