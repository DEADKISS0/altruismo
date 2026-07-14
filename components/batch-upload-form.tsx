"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPage, uploadFiles, getCategories } from "@/lib/services";
import { PageCategory } from "@/types";
import { Upload, Loader2, X, Plus, FileCode, Check } from "lucide-react";
import { toast } from "sonner";

interface BatchItem {
  id: string;
  file: File | null;
  title: string;
  description: string;
  category: PageCategory | "";
  status: "pending" | "uploading" | "done" | "error";
}

interface BatchUploadFormProps {
  onSuccess?: () => void;
}

export function BatchUploadForm({ onSuccess }: BatchUploadFormProps) {
  const { messages, locale } = useLocale();
  const router = useRouter();
  const categories = getCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<BatchItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const addItems = (files: FileList | null) => {
    if (!files) return;
    const newItems: BatchItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      description: "",
      category: "",
      status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BatchItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleUpload = async () => {
    const pendingItems = items.filter((i) => i.status === "pending" && i.file);
    if (pendingItems.length === 0) {
      toast.error(messages.common.error, {
        description: locale === "es" ? "No hay archivos para subir" : "No files to upload",
      });
      return;
    }

    setIsUploading(true);
    setProgress({ done: 0, total: pendingItems.length });

    let successCount = 0;
    let errorCount = 0;

    for (const item of pendingItems) {
      try {
        updateItem(item.id, "status", "uploading");

        const fileUrl = await uploadFiles([item.file!]);
        const sourceCode = await item.file!.text();
        const page = await createPage({
          title: item.title,
          description: item.description || null,
          category: item.category || null,
          file_url: fileUrl,
          is_open_source: true,
          source_code: sourceCode,
        });

        updateItem(item.id, "status", "done");
        successCount++;
      } catch {
        updateItem(item.id, "status", "error");
        errorCount++;
      }

      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast.success(
        locale === "es"
          ? `${successCount} herramienta${successCount > 1 ? "s" : ""} publicada${successCount > 1 ? "s" : ""}`
          : `${successCount} tool${successCount > 1 ? "s" : ""} published`
      );
      if (onSuccess) {
        onSuccess();
      }
    }
    if (errorCount > 0) {
      toast.error(
        locale === "es"
          ? `${errorCount} error${errorCount > 1 ? "es" : ""}`
          : `${errorCount} error${errorCount > 1 ? "s" : ""}`
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".html"
          className="hidden"
          onChange={(e) => {
            addItems(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="border-border text-parchment"
        >
          <Plus className="mr-2 h-4 w-4" />
          {locale === "es" ? "Agregar archivos HTML" : "Add HTML files"}
        </Button>
        <span className="text-sm text-ash">
          {items.length === 0
            ? locale === "es"
              ? "Selecciona uno o varios archivos .html"
              : "Select one or more .html files"
            : locale === "es"
            ? `${items.length} archivo${items.length > 1 ? "s" : ""} seleccionado${items.length > 1 ? "s" : ""}`
            : `${items.length} file${items.length > 1 ? "s" : ""} selected`}
        </span>
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 bg-card border rounded-lg transition-colors ${
                item.status === "done"
                  ? "border-green-500/50"
                  : item.status === "error"
                  ? "border-red-500/50"
                  : item.status === "uploading"
                  ? "border-ember/50"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {item.status === "done" ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : item.status === "error" ? (
                    <X className="h-5 w-5 text-red-500" />
                  ) : item.status === "uploading" ? (
                    <Loader2 className="h-5 w-5 text-ember animate-spin" />
                  ) : (
                    <FileCode className="h-5 w-5 text-ash" />
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ash font-mono truncate max-w-[200px]">
                      {item.file?.name}
                    </span>
                    <span className="text-xs text-ash">
                      ({item.file ? Math.round(item.file.size / 1024) : 0} KB)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-ash">Título</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updateItem(item.id, "title", e.target.value)}
                        className="bg-pitch border-border text-parchment h-8 text-sm"
                        disabled={item.status !== "pending"}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-ash">Categoría</Label>
                      <Select
                        value={item.category}
                        onValueChange={(v) => updateItem(item.id, "category", v)}
                        disabled={item.status !== "pending"}
                      >
                        <SelectTrigger className="bg-pitch border-border text-parchment h-8 text-sm">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent className="bg-pitch border-border">
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="text-parchment">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-ash">Descripción (opcional)</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="bg-pitch border-border text-parchment min-h-[60px] text-sm"
                      disabled={item.status !== "pending"}
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  disabled={isUploading}
                  className="p-1 text-ash hover:text-ember transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          {isUploading && (
            <div className="text-sm text-ash text-center">
              {locale === "es"
                ? `Subiendo ${progress.done}/${progress.total}...`
                : `Uploading ${progress.done}/${progress.total}...`}
            </div>
          )}
          <Button
            onClick={handleUpload}
            disabled={isUploading || items.filter((i) => i.status === "pending").length === 0}
            className="w-full bg-ember text-parchment hover:bg-ember/90"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading
              ? locale === "es"
                ? "Subiendo..."
                : "Uploading..."
              : locale === "es"
              ? `Publicar ${items.filter((i) => i.status === "pending").length} herramienta${items.filter((i) => i.status === "pending").length > 1 ? "s" : ""}`
              : `Publish ${items.filter((i) => i.status === "pending").length} tool${items.filter((i) => i.status === "pending").length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
