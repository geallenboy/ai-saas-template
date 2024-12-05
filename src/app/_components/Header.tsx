"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { MenuList } from "@/constants";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const Header = () => {
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActive = (path: string) => usePathname() === path;
  return (
    <header className="w-full shadow-md flex items-center justify-between px-8">
      <div className=" flex items-center justify-center">
        <Image src={"/logo.svg"} alt="logo" width={40} height={40} />
        <h2 className="font-bold text-2xl text-primary ml-3">nextjs模版</h2>
      </div>
      <nav className="px-4 flex items-center justify-between h-16">
        <ul className="hidden md:flex space-x-6">
        {
          MenuList.map((item, index) => (
          <li>
            <Link className={`${
                isActive(item.path)
                  ? "text-blue-500 font-semibold"
                  : "text-gray-700"
              } hover:text-blue-500 transition duration-150 ease-in-out`} href={item.path}>{item.name}</Link>
            </li>
        ))}
        </ul>
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <ul className="absolute top-16 left-0 w-full bg-white shadow-lg md:hidden">
            <li className="border-b">
              <Link
                href="/"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className="border-b">
              <Link
                href="/about"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </li>
            <li className="border-b">
              <Link
                href="/services"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
            </li>
            <li className="border-b">
              <Link
                href="/contact"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </li>
          </ul>
        )}
      </nav>
      <div className=" items-center gap-2 hidden md:flex">
        <Link href={"/dashboard"}>
          <Button color={"primary"}>
            {isSignedIn ? "仪表盘" : "立即开始"}
          </Button>
        </Link>
        <UserButton />
      </div>
    </header>
  );
};

export default Header;
