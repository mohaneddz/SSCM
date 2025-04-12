import { Button } from "@/components/ui/button";
import Link from "next/link";
import BentoGridSection from "./_components/bento-grid-section";
import FloatingCircleButton from "./_components/floatingcirclebutton";
import { createClient } from "@/utils/supabase/server"
import Image from 'next/image';

// This is a Server Component. It fetches the user data on the server and renders the entire page.
export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error);
    // Consider handling the error more gracefully, e.g., display an error message
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/server-bg.jpg')] bg-cover bg-center bg-fixed"></div>
        </div>
        <div className="container relative z-10 px-6 mx-auto text-center lg:px-20 mb-16">
          <div className="space-y-6">
            <h1 className="max-w-6xl mx-auto text-3xl font-black text-green-500 dark:text-green-400 sm:text-5xl lg:text-6xl">
              Smart. Secure. Sustainable. Empowering Server Centers with Intelligent Control
            </h1>

            <p className="max-w-3xl mx-auto text-gray-300">
              Mobilis introduces an innovative Smart Temperature and Security System designed to protect and optimize server infrastructures across Algeria. With real-time monitoring, AI-powered insights, and reliable alerts, we ensure your data centers remain cool, safe, and always operational.
            </p>

            <div className="flex items-center justify-center gap-3 mt-16">

              <Button className="text-white transition duration-300 bg-green-600 rounded-full dark:bg-green-500 hover:bg-green-500 dark:hover:bg-green-400">
                <Link href={user ? "/dashboard" : "/login"}>
                  {user ? "Go to Dashboard" : "Get Started"}
                </Link>
              </Button>

              <Button variant="outline" className="text-green-600 transition duration-300 border-green-600 rounded-full dark:text-green-500 dark:border-green-500 hover:bg-green-500 dark:hover:bg-green-400 hover:text-white">
                <a href="#features">Explore</a>
              </Button>
            </div>
          </div>

          <div className="flex justify-center mt-16">
            <a href="#features" className="animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6  space-y-12 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center text-green-500">Key Features</h2>
        <BentoGridSection />
      </section>

      {/* How It Works Section with Parallax */}
      <section className="relative py-24 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[url('/datacenter.jpg')] bg-cover bg-center bg-fixed"></div>
        </div>
        <div className="container relative z-10 px-6 mx-auto lg:px-20">
          <h2 className="mb-16 text-3xl font-bold text-center text-green-600 dark:text-green-400 lg:text-4xl">
            How Our System Works
          </h2>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-xl dark:bg-gray-900">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Sensor Network</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our Raspberry Pi devices equipped with temperature, humidity, motion, and smoke sensors continuously monitor your server environment.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-xl dark:bg-gray-900">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Secure Data Transmission</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Data is securely transmitted via encrypted MQTT protocol to our cloud-based system for real-time processing and analysis.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-xl dark:bg-gray-900">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Intelligent Dashboard</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Access your comprehensive dashboard for real-time monitoring, alerts, and remote control of your server environment from anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-green-600 dark:bg-green-800">
        <div className="container px-6 mx-auto lg:px-20">
          <h2 className="mb-16 text-3xl font-bold text-center text-white lg:text-4xl">
            Why Choose Our Solution
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 text-center bg-white rounded-lg shadow-lg dark:bg-gray-900">
              <h3 className="text-4xl font-bold text-green-600">99.9%</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Uptime Reliability</p>
            </div>

            <div className="p-6 text-center bg-white rounded-lg shadow-lg dark:bg-gray-900">
              <h3 className="text-4xl font-bold text-green-600">30%</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Energy Cost Reduction</p>
            </div>

            <div className="p-6 text-center bg-white rounded-lg shadow-lg dark:bg-gray-900">
              <h3 className="text-4xl font-bold text-green-600">24/7</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Monitoring & Support</p>
            </div>

            <div className="p-6 text-center bg-white rounded-lg shadow-lg dark:bg-gray-900">
              <h3 className="text-4xl font-bold text-green-600">5-min</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Average Alert Response Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container px-6 mx-auto lg:px-20">
          <h2 className="mb-16 text-3xl font-bold text-center text-gray-900 dark:text-white lg:text-4xl">
            Trusted by IT Professionals
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 mr-4 overflow-hidden bg-gray-300 rounded-full">
                  <div className="w-full h-full bg-green-200"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Mohammed Benali</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">IT Director, Algiers Data Center</p>
                </div>
              </div>
              <p className="italic text-gray-700 dark:text-gray-300">
                "This system has revolutionized how we manage our server rooms. The real-time alerts have prevented at least two potential overheating incidents."
              </p>
            </div>

            <div className="p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 mr-4 overflow-hidden bg-gray-300 rounded-full">
                  <div className="w-full h-full bg-green-200"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Samira Hakim</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">System Administrator, Oran Tech Hub</p>
                </div>
              </div>
              <p className="italic text-gray-700 dark:text-gray-300">
                "The dashboard is intuitive and gives us complete visibility into our infrastructure. We've reduced our energy costs significantly since implementation."
              </p>
            </div>

            <div className="p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 mr-4 overflow-hidden bg-gray-300 rounded-full">
                  <div className="w-full h-full bg-green-200"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Karim Bencherif</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Security Manager, Constantine Data Solutions</p>
                </div>
              </div>
              <p className="italic text-gray-700 dark:text-gray-300">
                "The security features are exceptional. We can instantly detect and respond to unauthorized access attempts, giving us peace of mind."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/server-room.jpg')] bg-cover bg-center bg-fixed"></div>
        </div>
        <div className="container relative z-10 px-6 mx-auto text-center lg:px-20">
          <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">Ready to Optimize Your Server Infrastructure?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-gray-300">
            Join the growing network of data centers across Algeria that are experiencing enhanced security, improved efficiency, and complete peace of mind.
          </p>
          <Button className="px-8 py-3 text-lg font-medium text-white transition duration-300 bg-green-600 rounded-full hover:bg-green-500">
            <Link href={user ? "/dashboard" : "/login"}>
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Floating Button if user is logged in */}
      {user && <FloatingCircleButton />}
    </div>
  );
}