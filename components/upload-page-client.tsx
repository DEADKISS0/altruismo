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
import { createPage, uploadFiles, getCategories, setPageTags } from "@/lib/services";
import { PageCategory } from "@/types";
import { TagSelector } from "@/components/tag-selector";
import { Upload, Loader2, X, Plus, FileCode, Check, File, Layers } from "lucide-react";
import { toast } from "sonner";

const categories = getCategories();

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SINGLE UPLOAD FORM
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SingleUploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const { messages, locale } = useLocale();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PageCategory | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error("Completa tÃ­tulo y archivo");
      return;
    }
    setIsLoading(true);
    try {
      const fileUrl = await uploadFiles([file]);
      const fileContent = await file.text();
      const page = await createPage({
        title,
        description: description || null,
        category: category || null,
        file_url: fileUrl,
        is_open_source: true,
        source_code: fileContent,
      });
      if (selectedTags.length > 0) {
        await setPageTags(page.id, selectedTags).catch(() => {});
      }
      toast.success("Herramienta publicada");
      if (onSuccess) onSuccess();
      else router.push(`/${locale}/page/${page.id}`);
    } catch {
      toast.error("No se pudo publicar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-parchment">Archivo HTML</Label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".html"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="single-file"
          />
          <label
            htmlFor="single-file"
            className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-ember/50 transition-colors text-ash hover:text-parchment"
          >
            {file ? (
              <>
                <FileCode className="h-5 w-5 text-ember" />
                <span className="text-sm">{file.name} ({Math.round(file.size / 1024)} KB)</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span className="text-sm">Seleccionar archivo .html</span>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-parchment">TÃ­tulo</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre de la herramienta"
          className="bg-pitch border-border text-parchment"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-parchment">DescripciÃ³n</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe quÃ© hace esta herramienta"
          className="bg-pitch border-border text-parchment min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-parchment">CategorÃ­a</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as PageCategory)}>
          <SelectTrigger className="bg-pitch border-border text-parchment">
            <SelectValue placeholder="Seleccionar categorÃ­a" />
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

      <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} />

      <Button
        type="submit"
        disabled={isLoading || !file}
        className="w-full bg-ember text-parchment hover:bg-ember/90"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {isLoading ? "Publicando..." : "Publicar herramienta"}
      </Button>
    </form>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// BATCH UPLOAD FORM
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface BatchItem {
  id: string;
  file: File;
  title: string;
  description: string;
  category: PageCategory | "";
  status: "pending" | "uploading" | "done" | "error";
}

function BatchUploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const { locale } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: BatchItem[] = Array.from(files)
      .filter((f) => f.name.endsWith(".html"))
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        title: file.name.replace(/\.html$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: "",
        category: "",
        status: "pending",
      }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof BatchItem, value: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleUpload = async () => {
    const pending = items.filter((i) => i.status === "pending");
    if (pending.length === 0) return;

    setIsUploading(true);
    setProgress({ done: 0, total: pending.length });
    let ok = 0, fail = 0;

    for (const item of pending) {
      try {
        updateItem(item.id, "status", "uploading");
        const fileUrl = await uploadFiles([item.file]);
        const sourceCode = await item.file.text();
        await createPage({
          title: item.title,
          description: item.description || null,
          category: item.category || null,
          file_url: fileUrl,
          is_open_source: true,
          source_code: sourceCode,
        });
        updateItem(item.id, "status", "done");
        ok++;
      } catch {
        updateItem(item.id, "status", "error");
        fail++;
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setIsUploading(false);
    if (ok > 0) toast.success(`${ok} herramienta${ok > 1 ? "s" : ""} publicada${ok > 1 ? "s" : ""}`);
    if (fail > 0) toast.error(`${fail} error${fail > 1 ? "es" : ""}`);
    if (ok > 0 && onSuccess) onSuccess();
  };

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".html"
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-ember/50 hover:bg-ember/5 transition-all text-ash hover:text-parchment"
      >
        <Layers className="h-8 w-8" />
        <div className="text-left">
          <p className="font-medium text-lg">
            {items.length === 0 ? "Seleccionar archivos HTML" : `${items.length} archivo${items.length > 1 ? "s" : ""} seleccionado${items.length > 1 ? "s" : ""}`}
          </p>
          <p className="text-sm text-ash">
            PodÃ©s elegir varios archivos .html de una vez
          </p>
        </div>
      </button>

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 bg-card border rounded-lg ${
                item.status === "done" ? "border-green-500/50" :
                item.status === "error" ? "border-red-500/50" :
                item.status === "uploading" ? "border-ember/50" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xs text-ash font-mono mt-1 w-6">#{index + 1}</span>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-ash">
                    <FileCode className="h-4 w-4" />
                    <span className="font-mono truncate">{item.file.name}</span>
                    <span className="text-xs">({Math.round(item.file.size / 1024)} KB)</span>
                    {item.status === "done" && <Check className="h-4 w-4 text-green-500" />}
                    {item.status === "error" && <X className="h-4 w-4 text-red-500" />}
                    {item.status === "uploading" && <Loader2 className="h-4 w-4 text-ember animate-spin" />}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={item.title}
                      onChange={(e) => updateItem(item.id, "title", e.target.value)}
                      placeholder="TÃ­tulo de la herramienta"
                      className="bg-pitch border-border text-parchment h-9"
                      disabled={item.status !== "pending"}
                    />
                    <Select
                      value={item.category || undefined}
                      onValueChange={(v) => updateItem(item.id, "category", v || "")}
                      disabled={item.status !== "pending"}
                    >
                      <SelectTrigger className="bg-pitch border-border text-parchment h-9">
                        <SelectValue placeholder="CategorÃ­a" />
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

                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="DescripciÃ³n (opcional)"
                    className="bg-pitch border-border text-parchment min-h-[60px] text-sm"
                    disabled={item.status !== "pending"}
                  />
                </div>

                <button
                  type="button"
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
            <p className="text-sm text-ash text-center">Subiendo {progress.done}/{progress.total}...</p>
          )}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || items.every((i) => i.status !== "pending")}
            className="w-full bg-ember text-parchment hover:bg-ember/90"
          >
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Publicar {items.filter((i) => i.status === "pending").length} herramienta{items.filter((i) => i.status === "pending").length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAIN UPLOAD PAGE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function UploadPageClient() {
  const { locale } = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "single" | "batch">("choose");

  // Version marker for cache busting

  const handleSuccess = () => {
    router.push(`/${locale}/feed`);
  };

  if (mode === "choose") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="font-heading text-4xl md:text-5xl text-parchment mb-3 text-center">
          {locale === "es" ? "SUBIR HERRAMIENTA v2" : "UPLOAD TOOL"}
        </h1>
        <p className="text-ash text-center mb-10">
          {locale === "es"
            ? "ElegÃ­ cÃ³mo querÃ©s subir tu herramienta"
            : "Choose how you want to upload your tool"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode("single")}
            className="group p-8 bg-card border border-border rounded-xl hover:border-ember/50 hover:shadow-[0_10px_40px_-10px_rgba(206,61,31,0.15)] transition-all text-left"
          >
            <File className="h-10 w-10 text-ember mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-heading text-xl text-parchment mb-2">Una herramienta</h3>
            <p className="text-sm text-ash">
              SubÃ­ un solo archivo HTML con tÃ­tulo, descripciÃ³n y categorÃ­a.
            </p>
          </button>

          <button
            onClick={() => setMode("batch")}
            className="group p-8 bg-card border border-border rounded-xl hover:border-ember/50 hover:shadow-[0_10px_40px_-10px_rgba(206,61,31,0.15)] transition-all text-left"
          >
            <Layers className="h-10 w-10 text-ember mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-heading text-xl text-parchment mb-2">Varias herramientas</h3>
            <p className="text-sm text-ash">
              SubÃ­ varios archivos HTML a la vez. Cada uno se publica como herramienta independiente.
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <button
        onClick={() => setMode("choose")}
        className="text-sm text-ash hover:text-parchment mb-6 flex items-center gap-1"
      >
        â† {locale === "es" ? "Volver" : "Back"}
      </button>

      <h1 className="font-heading text-3xl text-parchment mb-2">
        {mode === "single" ? "Subir una herramienta" : "Subir varias herramientas"}
      </h1>
      <p className="text-ash mb-8">
        {mode === "single"
          ? "CompletÃ¡ los datos de tu herramienta y subÃ­ el archivo HTML."
          : "ElegÃ­ los archivos HTML, ponÃ© un tÃ­tulo y descripciÃ³n a cada uno, y publicalos todos de una."}
      </p>

      {mode === "single" ? (
        <SingleUploadForm onSuccess={handleSuccess} />
      ) : (
        <BatchUploadForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}

// 2026-07-14 03:30:29

