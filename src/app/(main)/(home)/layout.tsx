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
      <main className=" min-w-screen max-w-screen overflow-x-hidden h-full  ">{children}</main>
      <Footer />
    </>
  );
}
