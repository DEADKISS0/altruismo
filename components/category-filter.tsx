"use client";

import { useLocale } from "@/components/locale-provider";
import { PageCategory } from "@/types";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selected: PageCategory | null;
  onChange: (category: PageCategory | null) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const { messages } = useLocale();
  const t = messages.feed;

  const categories: { value: PageCategory | null; label: string }[] = [
    { value: null, label: t.allCategories },
    { value: "productivity", label: t.categories.productivity },
    { value: "health", label: t.categories.health },
    { value: "entertainment", label: t.categories.entertainment },
    { value: "data", label: t.categories.data },
    { value: "professional", label: t.categories.professional },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.value || "all"}
          variant={selected === cat.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(cat.value)}
          className={
            selected === cat.value
              ? "bg-ember text-parchment hover:bg-ember/90"
              : "border-border text-parchment hover:bg-void"
          }
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
