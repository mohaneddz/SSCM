'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h1 className="text-4xl text-primary font-bold mb-4">Something went wrong!</h1>
          <p className="text-lg mb-6 text-slate-500">A global application error occurred</p>
          {/* <p className="text-sm text-red-500 mb-6">{error?.message || 'Unknown error'}</p> */}
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-green-700 hover:scale-105 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}




