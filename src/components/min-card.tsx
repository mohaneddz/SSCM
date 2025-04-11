import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  // tabler
  import { TablerIcon } from "@tabler/icons-react";

  interface MiniCardProps {
    icon: TablerIcon;
    title: string;
    value1: string | number;
    value2?: string | number; // Optional second value
    iconColor?: string; // Optional icon color
  }
  
export default function MiniCard({
    icon: Icon,
    title,
    value1,
    value2,
    iconColor = "text-primary", // Default icon color
}: MiniCardProps) {
    return (
      <Card className="">
        <CardContent className="flex flex-row items-center space-x-4 p-3 pl-7">
          <Icon className={`h-6 w-6 ${iconColor}`} />
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1 space-y-1">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-2xl font-bold tracking-tight">{value1}</div>
            {value2 && <div className="text-sm text-muted-foreground">{value2}</div>}
          </div>
        </CardContent>
      </Card>
    );
  };