import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

export const Logo = () => {
  const T = useTranslations("app");
  return (
    <Link href={"/"} className="flex items-center gap-2">
      <Sparkles strokeWidth={1.5} />
      <span className="text-lg font-semibold">{T("name")}</span>
    </Link>
  );
};

export default Logo;
