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
      <main className=" min-w-screen max-w-screen overflow-x-hidden h-full p-4 sm:p-6">{children}</main>
      <Footer />
    </>
  );
}
