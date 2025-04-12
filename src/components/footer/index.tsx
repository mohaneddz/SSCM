import React from "react";

const Footer = () => {
  return (
    <footer className="w-full">
      <div className=" relative p-4 sm:p-6 flex flex-col items-center justify-center gap-1 w-screen">
        <h3 className="font-bold">
          Mobilis - Smart Temperature and Security System for call centers
        </h3>

        <p className="text-sm">
          Build by{" "}
          <a
            target="_blank"
            className="underline"
          >
            The Firelights Team
          </a>
          .
        </p>

      </div>
    </footer>
  );
};

export default Footer;
