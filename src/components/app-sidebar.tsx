import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconBrandAppleArcade,
  IconInnerShadowTop,
  IconReport,
  IconIkosaedr,
  IconSettings,
  IconShieldHalfFilled,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Mobilis Admin",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
      id: "dashboard",
    },
  ],
  // navClouds: [
  //   {
  //     title: "Capture",
  //     icon: IconCamera,
  //     isActive: true,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      id: "settings",
      icon: IconSettings,
    },
  ],
  documents: [
    {
      name: "Access Control",
      url: "#",
      icon: IconShieldHalfFilled,
      id: "access",
    },
    {
      name: "Warranties",
      url: "#",
      icon: IconBrandAppleArcade,
      id: "warranties",
    },
    {
      name: "Logs",
      url: "#",
      icon: IconReport,
      id: "logs",
    },
    {
      name: "3D Simulation",
      url: "#",
      icon: IconIkosaedr,
      id: "simulation",
    },
  ],
}

export function AppSidebar({ changePage, ...props }: React.ComponentProps<typeof Sidebar> & { changePage: (page: string) => void }) {

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Mobilis Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} changePage={changePage}/>
        <NavDocuments items={data.documents} changePage={changePage} />
        <NavSecondary items={data.navSecondary} className="mt-auto" changePage={changePage} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
