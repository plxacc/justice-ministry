import "@/app/globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "محكمة مدينة العدالة | وزارة العدل",
  description: "البوابة الرقمية الموحدة للقضاة والمحامين وكتاب العدل",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col antialiased text-[#2b1b11] selection:bg-[#3b2a1e] selection:text-[#f4ece1]">
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}