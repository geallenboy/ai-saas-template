import {
  Settings2,
  SquareTerminal,
  CreditCard,
  UploadCloud,
} from "lucide-react";

export const navList = {
  en: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "credits",
      url: "/credits",
      icon: CreditCard,
      isActive: true,
    },
    {
      title: "Upload",
      url: "/upload",
      icon: UploadCloud,
    },
    {
      title: "Settings",
      url: "/account-settings",
      icon: Settings2,
    },
  ],
  zh: [
    {
      title: "仪表盘",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "积分",
      url: "/credits",
      icon: CreditCard,
      isActive: true,
    },
    {
      title: "上传图片",
      url: "/upload",
      icon: UploadCloud,
    },
    {
      title: "设置",
      url: "/account-settings",
      icon: Settings2,
    },
  ],
};
