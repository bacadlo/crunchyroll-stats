import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PetalCanvasBackground } from '@/components/PetalCanvasBackground';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = localFont({
  src: './fonts/Inter-VariableFont_opsz,wght.ttf',
  variable: '--font-body',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: true,
});

const orbitron = localFont({
  src: [
    {
      path: './fonts/Orbitron-VariableFont_wght.ttf',
      weight: '400 900',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Crunchyroll Watch List',
  description: 'Track and analyze your Crunchyroll watch history',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${orbitron.variable}`}>
        <ThemeProvider>
          <PetalCanvasBackground />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
