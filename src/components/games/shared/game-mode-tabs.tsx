"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Crosshair } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  explore: ReactNode;
  hunt: ReactNode;
  defaultTab?: "explore" | "hunt";
};

/** Shared Explore / Hunt tabs for map games. Explore opens by default. */
export function GameModeTabs({
  explore,
  hunt,
  defaultTab = "explore",
}: Props) {
  return (
    <Tabs defaultValue={defaultTab} className="gap-4">
      <TabsList variant="line" className="w-full max-w-sm">
        <TabsTrigger value="explore" className="gap-1.5">
          <BookOpen className="size-3.5 opacity-70" />
          Explore
        </TabsTrigger>
        <TabsTrigger value="hunt" className="gap-1.5">
          <Crosshair className="size-3.5 opacity-70" />
          Hunt
        </TabsTrigger>
      </TabsList>
      <TabsContent value="explore" className="outline-none">
        {explore}
      </TabsContent>
      <TabsContent value="hunt" className="outline-none">
        {hunt}
      </TabsContent>
    </Tabs>
  );
}
