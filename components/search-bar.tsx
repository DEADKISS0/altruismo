"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { messages } = useLocale();
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
      <Input
        type="text"
        placeholder={messages.feed.searchPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-pitch border-border text-parchment placeholder:text-ash focus-visible:ring-ember"
      />
    </div>
  );
}
