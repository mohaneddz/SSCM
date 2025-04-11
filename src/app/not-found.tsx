import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="">
            <div className="bg-background flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-4xl text-primary font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-lg mb-6 text-slate-500">Oops! The page you are looking for does not exist.</p>
                <Link
                    href="/content"
                    className="px-6 py-3 bg-primary text-white rounded-md hover:bg-green-700 hover:scale-105 transition-colors duration-300"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}