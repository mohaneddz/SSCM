import { forwardRef, useEffect, useState } from "react"
 import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { chartData, chartData2, chartData3, chartData4 } from "@/data/charData"

export default function SectionCharts() {

  const [selectedChart, setSelectedChart] = useState("chartData")
  const [chart, setChart] = useState(chartData)
  const [title, setTitle] = useState("Temperature")
  const [description, setDescription] = useState("Temperature in going up")

  useEffect(() => {
    switch (selectedChart) {
      case "chartData":
        setChart(chartData)
        setTitle("Temperature")
        setDescription("Previous temperature")
        break
      case "chartData2":
        setChart(chartData2)
        setTitle("Humidity")
        setDescription("Humidity is going down")
        break
      case "chartData3":
        setChart(chartData3)
        setTitle("Co2")
        setDescription("Co2 level is going up")
        break
      case "chartData4":
        setChart(chartData4)
        setTitle("Light")
        setDescription("Light is going down")
        break
      default:
        setChart(chartData)
    }
  }, [selectedChart]);

  return (

    <div className="">


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button className="my-4" variant="outline">Switch Chart</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuRadioGroup value={selectedChart} onValueChange={setSelectedChart}>

            <DropdownMenuRadioItem value="chartData" >Temperature</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="chartData2" >Humidity</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="chartData3" >Co2</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="chartData4" >Light</DropdownMenuRadioItem>

          </DropdownMenuRadioGroup>

        </DropdownMenuContent>
      </DropdownMenu>

      <ChartAreaInteractive chartData={chart} title={title} desc={description} />


    </div >
  )
}

