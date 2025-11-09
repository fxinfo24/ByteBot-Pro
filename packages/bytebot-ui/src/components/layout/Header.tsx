import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  DocumentCodeIcon,
  TaskDaily01Icon,
  Home01Icon,
  ComputerIcon,
  Sun02Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons";
import { usePathname } from "next/navigation";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // After mounting, we can safely show the theme-dependent content
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  // Get classes for navigation links based on active state
  const getLinkClasses = (path: string) => {
    const baseClasses =
      "flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg";
    const activeClasses =
      "bg-bytebot-bronze-light-a3 text-bytebot-bronze-light-12";
    const inactiveClasses =
      "text-bytebot-bronze-dark-9 hover:bg-bytebot-bronze-light-a1 hover:text-bytebot-bronze-light-12";

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <header className="bg-background flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-6">
        {/* Logo without link */}
        <div>
          {mounted ? (
            <Image
              src={
                resolvedTheme === "dark"
                  ? "/bytebot_transparent_logo_white.svg"
                  : "/bytebot_transparent_logo_dark.svg"
              }
              alt="Bytebot Logo"
              width={100}
              height={30}
              className="h-8 w-auto"
            />
          ) : (
            <div className="h-8 w-[110px]" />
          )}
        </div>
        <div className="border-bytebot-bronze-dark-11 h-5 border border-l-[0.5px]"></div>
        <div className="flex items-center gap-2">
          <Link href="/" className={getLinkClasses("/")}>
            <HugeiconsIcon icon={Home01Icon} className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/tasks" className={getLinkClasses("/tasks")}>
            <HugeiconsIcon icon={TaskDaily01Icon} className="h-4 w-4" />
            <span className="text-sm">Tasks</span>
          </Link>
          <Link href="/desktop" className={getLinkClasses("/desktop")}>
            <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4" />
            <span className="text-sm">Desktop</span>
          </Link>
          <Link
            href="https://docs.bytebot.ai/quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className={getLinkClasses("https://docs.bytebot.ai")}
          >
            <HugeiconsIcon icon={DocumentCodeIcon} className="h-4 w-4" />
            <span className="text-sm">Docs</span>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center h-8 w-8 rounded-md border border-bytebot-bronze-light-7 bg-bytebot-bronze-light-1 text-bytebot-bronze-dark-9 hover:bg-bytebot-bronze-light-3 transition-colors"
          aria-label="Toggle theme"
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <HugeiconsIcon icon={Sun02Icon} className="h-4 w-4" />
            ) : (
              <HugeiconsIcon icon={Moon02Icon} className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
