import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import BentoGridSection from "./_components/bento-grid-section";
import FloatingCircleButton from "./_components/floatingcirclebutton";
import { createClient } from "@/utils/supabase/server";

const HomePage = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <section className="grid place-content-center place-items-center gap-6 text-center">
        <h1 className="max-w-6xl text-green-500">
          Smart. Secure. Sustainable. Empowering Server Centers with Intelligent Control
        </h1>

        <p className="max-w-3xl text-gray-700 dark:text-gray-300">
          Mobilis introduces an innovative Smart Temperature and Security System designed to protect and optimize server infrastructures across Algeria. With real-time monitoring, AI-powered insights, and reliable alerts, we ensure your data centers remain cool, safe, and always operational.
        </p>

        <div className="flex items-center gap-3">
          <Button className="rounded-full bg-green-600 dark:bg-green-500 hover:bg-green-500 dark:hover:bg-green-400 text-white transition duration-300">
            <Link href="/login">Get Started</Link>
          </Button>

          <Button variant="outline" className="rounded-full text-green-600 dark:text-green-500 border-green-600 dark:border-green-500 hover:bg-green-500 dark:hover:bg-green-400 hover:text-white transition duration-300">
            <a href="">Explore</a>
          </Button>
        </div>
      </section>

      <section className="space-y-12">
        <h2 className="text-center text-green-500">Key Features</h2>
        <BentoGridSection />
      </section>

      {user && <FloatingCircleButton />}
    </div>
  );
};

export default HomePage;
