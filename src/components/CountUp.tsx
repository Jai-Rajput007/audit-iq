import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const CountUp = ({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: value,
      duration: 1.4,
      ease: "power3.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.v).toLocaleString() + suffix;
      },
    });
    return () => { tween.kill(); };
  }, [value, suffix]);
  return <span ref={ref} className={cn(className)}>0{suffix}</span>;
};
