import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  Activity,
  ThermometerSnowflake,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  BrainCircuit,
  LockKeyhole,
  Palette,
  LayoutDashboard,
} from "lucide-react";

const features = [
  {
    Icon: BrainCircuit,
    name: "AI-Powered Intelligence",
    description:
      "Predictive algorithms optimize cooling schedules and detect anomalies in security patterns before they become threats.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: <div />,
  },
  {
    Icon: Activity,
    name: "Real-Time Monitoring",
    description:
      "Stay informed with continuous tracking of temperature levels and security status across all monitored zones.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: <div />,
  },
  {
    Icon: ThermometerSnowflake,
    name: "Automated Temperature Control",
    description:
      "Smart sensors adjust cooling systems dynamically, conserving energy while maintaining optimal server conditions.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: <div />,
  },
  {
    Icon: AlertTriangle,
    name: "Advanced Alert System",
    description:
      "Instant alerts via SMS, email, or dashboard notifications when temperature thresholds or unauthorized access attempts are detected.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: <div />,
  },
  {
    Icon: ShieldCheck,
    name: "Multi-Layer Security",
    description:
      "Includes RFID, keypad, and optional facial recognition access control—backed by intrusion detection sensors and real-time logging.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: <div />,
  },
  {
    Icon: BarChart3,
    name: "Data Logging & Analytics",
    description:
      "Automatically logs temperature data and access records, allowing you to analyze trends and generate performance reports.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: <div />,
  },
  {
    Icon: LockKeyhole,
    name: "Authentication",
    description:
      "Secure your application with the robust authentication provided using Supabase Auth.",
    href: "https://supabase.com/docs/guides/auth/server-side/nextjs",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: <div />,
  },
  {
    Icon: Palette,
    name: "Modern UI",
    description:
      "Craft stunning and responsive user interfaces with the latest design principles and practices.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: <div />,
  },
];

const BentoGridSection = () => {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
};

export default BentoGridSection;
