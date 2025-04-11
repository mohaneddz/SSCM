import Footer from "@/components/footer";
import Navbar from "@/components//navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />

      <main className="container w-full h-full p-4 wflex-1 sm:p-6">{children}</main>

      <Footer />
    </>
  );
}
