"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPage, uploadFiles, getCategories, setPageTags } from "@/lib/services";
import { PageCategory } from "@/types";
import { TagSelector } from "@/components/tag-selector";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadFormProps {
  onSuccess?: () => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const { messages, locale } = useLocale();
  const router = useRouter();
  const t = messages.upload;
  const categories = getCategories();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PageCategory | "">("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isOpenSource, setIsOpenSource] = useState(false);
  const [sourceCode, setSourceCode] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !files?.length) {
      toast.error(messages.common.error, {
        description: locale === "es" ? "Completa todos los campos" : "Fill all fields",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileArray = Array.from(files);
      const fileUrl = await uploadFiles(fileArray);
      const page = await createPage({
        title,
        description,
        category: category || null,
        file_url: fileUrl,
        is_open_source: isOpenSource,
        source_code: isOpenSource ? sourceCode : null,
      });
      if (selectedTags.length > 0) {
        await setPageTags(page.id, selectedTags).catch(() => {});
      }
      toast.success(messages.common.success, {
        description: locale === "es" ? "Página publicada" : "Page published",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/page/${page.id}`);
      }
    } catch {
      toast.error(messages.common.error, {
        description: locale === "es" ? "No se pudo publicar" : "Could not publish",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-parchment">{t.name}</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-pitch border-border text-parchment"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-parchment">{t.description}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-pitch border-border text-parchment min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-parchment">{t.category}</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as PageCategory)}>
          <SelectTrigger className="bg-pitch border-border text-parchment">
            <SelectValue placeholder={messages.feed.allCategories} />
          </SelectTrigger>
          <SelectContent className="bg-pitch border-border">
            {categories.map((cat) => (
              <SelectItem
                key={cat.value}
                value={cat.value}
                className="text-parchment focus:bg-void focus:text-parchment"
              >
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} />

      <div className="space-y-2">
        <Label htmlFor="files" className="text-parchment">{t.files}</Label>
        <Input
          id="files"
          type="file"
          multiple
          accept=".html,.css,.js"
          onChange={(e) => setFiles(e.target.files)}
          className="bg-pitch border-border text-parchment file:text-ash"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="open-source"
          checked={isOpenSource}
          onCheckedChange={(checked) => setIsOpenSource(checked as boolean)}
        />
        <Label htmlFor="open-source" className="text-parchment cursor-pointer">
          {t.openSource}
        </Label>
      </div>

      {isOpenSource && (
        <div className="space-y-2">
          <Label htmlFor="source" className="text-parchment">{t.sourceCode}</Label>
          <Textarea
            id="source"
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="bg-pitch border-border text-parchment min-h-[200px] font-mono"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="bg-ember text-parchment hover:bg-ember/90"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {t.submit}
      </Button>
    </form>
  );
}
