"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";

import data from "@/data/data.json";

interface PageContextType {
  page: string;
  setPage: Dispatch<SetStateAction<string>>;
}

const PageContext = createContext<PageContextType>({ page: "Dashboard", setPage: () => {} });

export function usePageContext() {
  return useContext(PageContext);
}

export default function layout({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState("Dashboard");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, supabase]);

  const changePage = (page: string) => {
    setPage(page);
    console.log("Page changed to: ", page);
  };

  return (
    <PageContext.Provider value={{ page, setPage }}>
      <SidebarProvider>
        <AppSidebar variant="inset" changePage={changePage} page={page} />
        <SidebarInset>
          <SiteHeader page={page} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </PageContext.Provider>
  );
}
