import { Tag } from "@/types";
import { X } from "lucide-react";

interface TagBadgeProps {
  tag: Tag;
  onRemove?: (tagId: string) => void;
  size?: "sm" | "md";
}

export function TagBadge({ tag, onRemove, size = "sm" }: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-void border border-border text-ash font-medium transition-colors hover:border-ember/50 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-parchment/10 transition-colors"
          aria-label={`Remove tag ${tag.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
