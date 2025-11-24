import './globals.css';
import { Providers } from './providers';
import Navigation from './components/Navigation';
import ThemeInitializer from './components/ThemeInitializer';

export const metadata = {
  title: 'LedgerWise - Finance Manager',
  description: 'Manage your finances with LedgerWise',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="transition-colors duration-200">
        <Providers>
          <ThemeInitializer />
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 pt-24 px-12 pb-10 max-w-[1400px] mx-auto w-full">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
