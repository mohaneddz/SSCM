import Image from "next/image";
import ComponentCard from "@/components/component-card";

const img1 = "/motor.png";
const img2 = "/motor.png";
const img3 = "/motor.png";

export default function Warranties() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full justify-center items-center text-center text-white">
      <div className="flex flex-wrap gap-4 justify-center items-center">
        <ComponentCard title="Motor 1" image={img1} />
        <ComponentCard title="Motor 2" image={img2} />
        <ComponentCard title="Motor 3" image={img3} />
      </div>
    </div>
  );
};
