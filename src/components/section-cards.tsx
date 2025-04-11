import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SectionCards({ data }: { data: any[] }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {data && data.map((item, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>

            <CardDescription>{item.name}</CardDescription>

            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {item.value}
            </CardTitle>

            <CardAction>
              <Badge variant="outline">
                {item.trendIcon === "up" ? 
                  <IconTrendingUp className={`${
                    item.eval === "good" ? "text-green-500" : 
                    item.eval === "bad" ? "text-red-500" : 
                    "text-muted-foreground"
                  }`}/> : 
                  <IconTrendingDown className={`${
                    item.eval === "good" ? "text-green-500" : 
                    item.eval === "bad" ? "text-red-500" : 
                    "text-muted-foreground"
                  }`} />
                }

                <p className={`${
                  item.eval === "good" ? "text-green-500" : 
                  item.eval === "bad" ? "text-red-500" : 
                  "text-muted-foreground"
                } flex items-center gap-2 text-sm font-medium leading-none`}>
                  {item.trend}
                </p>

              </Badge>
            </CardAction>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {item.description}
            </div>
            <div className="text-muted-foreground">
              {item.footer}
            </div>
          </CardFooter>

        </Card>
      ))
      }

    </div >
  )
}
