"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction } from "react";
import { IconAlignBoxCenterTop, IconBrandTabler, IconCalendarEvent, IconMail, IconUsersGroup } from "@tabler/icons-react"

import data from "@/data/data.json"

interface PageContextType {
  page: string;
  setPage: Dispatch<SetStateAction<string>>;
}

const PageContext = createContext<PageContextType>({ page: "Members", setPage: () => { } });

export function usePageContext() {
  return useContext(PageContext);
}

export default function layout({ children }: { children: React.ReactNode }) {

  const [page, setPage] = useState("Members");

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


const example = () => {
  <div className="flex flex-1 flex-col">
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  </div>
}