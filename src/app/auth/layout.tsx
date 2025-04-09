import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { useState } from "react"

import data from "@/data/data.json"

export default function Page() {

  const [page, setPage] = useState("dashboard")

  const changePage = (page: string) => {
    setPage(page)
  }

  return (

    <SidebarProvider>
      {/* @ts-ignore */}
      <AppSidebar variant="inset" changePage={changePage} currentPage={page} />

      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6 h-min">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>

    </SidebarProvider>

  )
}
