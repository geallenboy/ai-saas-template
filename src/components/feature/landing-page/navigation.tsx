import React from "react";
import Logo from "@/components/custom/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "./language-switcher";
import { ModeToggle } from "./mode-toggle";
import { AuroraText } from "../../magicui/aurora-text";

const NavItemsRight = ({ user }: { user: any }) => {
  const homeT = useTranslations("home.navigtion");
  return (
    <>
      <LanguageSwitcher />
      <ModeToggle />
      {user ? (
        <Link
          href={"/dashboard"}
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          <Button variant={"outline"}> {homeT("name")}</Button>
        </Link>
      ) : (
        <Link
          href={"/signin"}
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          <Button variant={"outline"}> {homeT("login")}</Button>
        </Link>
      )}
    </>
  );
};
const NavItemsLeft = () => {
  const homeT = useTranslations("home.navigtion");
  return (
    <>
      <Link
        href={"#features"}
        className="text-sm font-medium hover:underline underline-offset-4"
      >
        {homeT("features")}
      </Link>
      <Link
        href={"#faqs"}
        className="text-sm font-medium hover:underline underline-offset-4"
      >
        {homeT("faqs")}
      </Link>
      <Link
        href={"https://github.com/geallenboy"}
        className="text-sm font-medium hover:underline underline-offset-4"
      >
        <AuroraText>{homeT("aboutMe")}</AuroraText>
      </Link>
      <Link
        href={"https://github.com/geallenboy/ai-saas-template"}
        className="text-sm font-medium hover:underline underline-offset-4 tracking-tighter"
      >
        <AuroraText>{homeT("github")}</AuroraText>
      </Link>
    </>
  );
};

const Navigtion = ({ user }: { user: any }) => {
  return (
    <div className="w-full bg-background/60 backdrop-blur-md fixed top-0 px-8 py-4 z-50 shadow-xl overflow-hidden">
      <header className="contariner mx-auto flex items-center ">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center justify-center gap-6">
            <Logo />
            <nav className="hidden md:flex items-center justify-center gap-3 ml-2">
              <NavItemsLeft />
            </nav>
          </div>
          <div className="hidden md:flex items-center justify-center gap-3">
            <NavItemsRight user={user} />
          </div>
        </div>
        <div className="ml-auto md:hidden overflow-hidden">
          <Sheet>
            <SheetTrigger>
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">导航</SheetTitle>
              <nav className="flex flex-col gap-4 mt-12">
                <NavItemsLeft />
                <NavItemsRight user={user} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
};

export default Navigtion;
