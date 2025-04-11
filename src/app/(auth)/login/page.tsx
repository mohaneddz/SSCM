import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ChevronLeftCircle } from "lucide-react";
import Link from "next/link";
import LoginForm from "./_components/login-form";

const LoginPage = () => {
  return (
    <section className="container flex items-center justify-center w-screen h-screen p-4 transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 space-y-6 transition-transform duration-300 transform bg-white rounded-lg shadow-lg dark:bg-gray-800 hover:scale-105">
        <Button variant="outline" asChild>
          <Link href="/" className={cn("absolute left-4 top-4 flex items-center text-gray-600 dark:text-gray-200")}>
            <ChevronLeftCircle className="w-5 h-5 mr-2" />
            Back
          </Link>
        </Button>

        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 transition-colors duration-300 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter your email and password to sign in to your account
          </p>
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <Link
              href="/register"
              className="font-semibold text-green-600 underline dark:text-green-600 hover:text-green-700 dark:hover:text-green-500"
            >
              Don&apos;t have an account? Register
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
