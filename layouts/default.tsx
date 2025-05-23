import { Head } from "./head";

import { Navbar } from "@/components/navbar";
import {HeroUIProvider} from "@heroui/react";
import {ThemeProvider as NextThemesProvider} from "next-themes";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative flex flex-col h-screen">
          <Head />
          <Navbar />
          <main className="flex">
            {children}
          </main>
        </div>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
