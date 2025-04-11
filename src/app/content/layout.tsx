"use client";

import { AppSidebar } from "@/components/app-sidebar"

import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction } from "react";

import data from "@/data/data.json"

interface PageContextType {
  page: string;
  setPage: Dispatch<SetStateAction<string>>;
}

const PageContext = createContext<PageContextType>({ page: "Dashboard", setPage: () => { } });

export function usePageContext() {
  return useContext(PageContext);
}

export default function layout({ children }: { children: React.ReactNode }) {

  const [page, setPage] = useState("Dashboard");

  const changePage = (page: string) => {
    setPage(page);
    console.log("Page changed to: ", page);
  }

  return (

<PageContext.Provider value={{ page, setPage }}>
      
      <SidebarProvider>

        <AppSidebar variant="inset" changePage={changePage}/>

        <SidebarInset>
          <SiteHeader />
            {children}
        </SidebarInset>

      </SidebarProvider>
    </PageContext.Provider>
    
  )
}
