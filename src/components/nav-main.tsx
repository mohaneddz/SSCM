import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils/cn"

export function NavMain({
  changePage,
  items,
  page,
}: {
  page: string
  items: {
    title: string
    url: string
    icon?: Icon,
    id: string
  }[], changePage: (page: string) => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <div onClick={() => changePage(item.id)} key={item.id}>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip={item.title}
                  data-active={page === item.id}
                  className={cn(
                    page === item.id && "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-accent font-medium"
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
