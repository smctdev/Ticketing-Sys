"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FontSize, useSettings, type Theme } from "@/context/settings-context";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type ThemeType = { value: Theme; label: string; color: string };
type FontSizeType = { value: FontSize; label: string; sample: string };

const themes: ThemeType[] = [
  {
    value: "light",
    label: "Light",
    color: "bg-background border-2 border-gray-200",
  },
  { value: "dark", label: "Dark", color: "bg-gray-900" },
  { value: "rose", label: "Rose", color: "bg-rose-500" },
  { value: "violet", label: "Violet", color: "bg-violet-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "green", label: "Green", color: "bg-green-600" },
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "pink", label: "Pink", color: "bg-pink-500" },
];

const fontSizes: FontSizeType[] = [
  { value: "sm", label: "Small", sample: "text-xs" },
  { value: "md", label: "Medium", sample: "text-sm" },
  { value: "lg", label: "Large", sample: "text-base" },
  { value: "xl", label: "Extra Large", sample: "text-xl" },
] as const;

//comment

export default function SettingsSheet() {
  const { isOpen, setIsOpen, theme, setTheme, fontSize, setFontSize } =
    useSettings();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 py-2">
          <section className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Theme
            </p>
            <div className="grid grid-cols-4 gap-3">
              {themes.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className="flex flex-col items-center gap-1.5 group"
                  title={label}
                >
                  <div
                    className={cn(
                      "relative h-9 w-9 rounded-full transition-transform group-hover:scale-110",
                      color,
                    )}
                  >
                    {theme === value && (
                      <Check
                        className={cn(
                          "absolute inset-0 m-auto h-4 w-4",
                          value === "light"
                            ? "dark:text-white text-gray-800"
                            : "text-white",
                        )}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="border-t" />

          <section className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Font Size
            </p>
            <div className="grid grid-cols-3 gap-2">
              {fontSizes.map(({ value, label, sample }) => (
                <button
                  key={value}
                  onClick={() => setFontSize(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border py-3 transition-colors hover:bg-accent",
                    fontSize === value
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <span className={cn("font-semibold", sample)}>Aa</span>
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
