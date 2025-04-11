import Footer from "@/components//footer";
import Navbar from "@/components//navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />

      <main className="container flex-1 p-4 sm:p-6">{children}</main>

      <Footer />
    </>
  );
}
''