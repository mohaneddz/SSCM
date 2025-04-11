import SectionCards from "@/components/section-cards"
import SectionCharts from "@/components/section-charts"
import SectionMiniCards from "@/components/section-mini-cards"

const data = [
  {
    "name": "Temperture",
    "value": "25.5°",
    "trend": "+12.5%",
    "trendIcon": "up",
    "eval": "bad",
    "description": "Temperature in going up",
    "footer": "Care is needed"
  },
  {
    "name": "Humidity",
    "value": "25.5%",
    "trend": "-5%",
    "trendIcon": "down",
    "eval": "good",
    "description": "Humidity is going down",
    "footer": "In a normal range"
  },
  {
    "name": "CO2 Level",
    "value": "1000 ppm",
    "trend": "+5%",
    "trendIcon": "up",
    "eval": "enutral",
    "description": "CO2 level is going up",
    "footer": "Care is needed"
  },
  {
    "name": "Light",
    "value": "1000 lux",
    "trend": "-5%",
    "trendIcon": "down",
    "eval": "bad",
    "description": "Light is going down",
    "footer": "In a normal range"
  }

]

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          <SectionCards data={data} />

          <div className="px-4 lg:px-6">

            <SectionCharts />

            <SectionMiniCards />
          </div>
        </div>
      </div>
    </div>
  );
};
