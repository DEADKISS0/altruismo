"use client";

import { useState, useEffect, useRef } from "react";
import { Tag } from "@/types";
import { TagBadge } from "@/components/tag-badge";
import { getTags } from "@/lib/services";
import { Input } from "@/components/ui/input";
import { Plus, Tags } from "lucide-react";

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTags().then(setAvailableTags).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.includes(inputValue.toLowerCase()) &&
      !selectedTags.includes(tag.name)
  );

  const addTag = (name: string) => {
    const normalized = name.toLowerCase().trim();
    if (normalized && !selectedTags.includes(normalized)) {
      onChange([...selectedTags, normalized]);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (tagName: string) => {
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 text-sm text-ash mb-2">
        <Tags className="h-4 w-4" />
        Tags
      </div>
      <div
        className="flex flex-wrap items-center gap-2 p-2 bg-pitch border border-border rounded-lg min-h-[42px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map((tagName) => (
          <TagBadge
            key={tagName}
            tag={{ id: tagName, name: tagName }}
            onRemove={() => removeTag(tagName)}
          />
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? "Agregar tags..." : ""}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-parchment text-sm"
        />
      </div>
      {isOpen && (inputValue || filteredTags.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => addTag(tag.name)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-parchment hover:bg-void transition-colors text-left"
              >
                <Plus className="h-3 w-3 text-ash" />
                {tag.name}
              </button>
            ))
          ) : (
            <button
              onClick={() => addTag(inputValue)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-parchment hover:bg-void transition-colors text-left"
            >
              <Plus className="h-3 w-3 text-ash" />
              Crear &quot;{inputValue}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
