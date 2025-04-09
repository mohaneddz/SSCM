import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
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
  // use INFO --------------------------------------
  user: {
    name: "Mobilis Admin",
    email: "mobilis@gmail.com",
    avatar: "/mobilis.jpg",
  },
  // use INFO --------------------------------------
  navMain: [
    {
      title: "Dashboard",
      id: "dashboard",
      icon: IconDashboard,
    },
  ],
  // use INFO --------------------------------------
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      id: "capture",
      items: [
        {
          title: "Active Proposals",
          id: "capture-active",
        },
        {
          title: "Archived",
          id: "capture-archived",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      id: "proposal",
      items: [
        {
          title: "Active Proposals",
          id: "proposal-active",
        },
        {
          title: "Archived",
          id: "proposal-archived",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      id: "prompts",
      items: [
        {
          title: "Active Proposals",
          id: "prompts-active",
        },
        {
          title: "Archived",
          id: "prompts-archived",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      id: "settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      id: "help",
      icon: IconHelp,
    },
    {
      title: "Search",
      id: "search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      id: "library",
      url: "/library",
      icon: IconDatabase,
    },
  ],
}

export function AppSidebar({ onContentChange, changePage, currentPage, ...props }: { onContentChange: (id: string) => void, changePage: (page: string) => void, currentPage: String } & React.ComponentProps<typeof Sidebar>) {
  const [activeSection, setActiveSection] = React.useState("dashboard")

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    onContentChange(id);
    changePage(id);
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* MAIN TITLE ONLY --------------------------------------------- */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              onClick={() => handleSectionChange("home")}
            >
              <button>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Mobilis Center</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* TOP SECTION  --------------------------------------------- */}
        <NavMain
          items={data.navMain}
          activeSection={activeSection}
          onSelect={handleSectionChange}
        />

        {/* MIDDLE SECTION --------------------------------------------- */}
        <NavDocuments
          items={data.documents}
          activeSection={activeSection}
          onSelect={handleSectionChange}
        />

        {/* BOTTOM SECTION  --------------------------------------------- */}
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto"
          activeSection={activeSection}
          onSelect={handleSectionChange}
        />
      </SidebarContent>

      {/* USER INFO SECTION  --------------------------------------------- */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}