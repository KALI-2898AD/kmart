import './globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import CartSidebar from '@/components/CartSidebar';

export const metadata = {
  title: 'Kmart | Premium Tech & More',
  description: 'An advanced Amazon-like marketplace built on Next.js and MongoDB, featuring order tracking, wishlist, reviews, and admin management.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <CartSidebar />
          <main className="main-wrapper">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
