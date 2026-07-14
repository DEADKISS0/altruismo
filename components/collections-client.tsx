"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { PageCard } from "@/components/page-card";
import { Collection, Page } from "@/types";
import { getCollections, getCollectionItems, createCollection, addToCollection, removeFromCollection } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Folder, Trash2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface CollectionsClientProps {
  userId?: string;
}

export function CollectionsClient({ userId }: CollectionsClientProps) {
  const { locale } = useLocale();
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Page[]>([]);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) return;
    getCollections(targetUserId)
      .then(setCollections)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [targetUserId]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const col = await createCollection(newName.trim(), newDesc.trim() || undefined);
      setCollections(prev => [col, ...prev]);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      toast.success(locale === "es" ? "Colección creada" : "Collection created");
    } catch {
      toast.error(locale === "es" ? "Error al crear" : "Failed to create");
    }
  };

  const handleExpand = async (colId: string) => {
    if (expandedId === colId) {
      setExpandedId(null);
      setExpandedItems([]);
      return;
    }
    setExpandedId(colId);
    try {
      const items = await getCollectionItems(colId);
      setExpandedItems(items.filter(i => i.page).map(i => i.page!));
    } catch {
      setExpandedItems([]);
    }
  };

  const handleRemoveItem = async (colId: string, pageId: string) => {
    try {
      await removeFromCollection(colId, pageId);
      setExpandedItems(prev => prev.filter(p => p.id !== pageId));
      toast.success(locale === "es" ? "Eliminado de colección" : "Removed from collection");
    } catch {
      toast.error(locale === "es" ? "Error al eliminar" : "Failed to remove");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create button */}
      {user?.id === targetUserId && (
        <div>
          {!showCreate ? (
            <Button
              variant="outline"
              onClick={() => setShowCreate(true)}
              className="border-border text-parchment hover:bg-void"
            >
              <Plus className="mr-2 h-4 w-4" />
              {locale === "es" ? "Nueva colección" : "New collection"}
            </Button>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-parchment text-sm">{locale === "es" ? "Nombre" : "Name"}</Label>
                  <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={locale === "es" ? "Mi colección favorita" : "My favorite collection"}
                    className="bg-pitch border-border text-parchment"
                  />
                </div>
                <div>
                  <Label className="text-parchment text-sm">{locale === "es" ? "Descripción" : "Description"}</Label>
                  <Textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder={locale === "es" ? "Describe esta colección..." : "Describe this collection..."}
                    className="bg-pitch border-border text-parchment min-h-[60px]"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={!newName.trim()} className="bg-ember text-parchment hover:bg-ember/90">
                    {locale === "es" ? "Crear" : "Create"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)} className="border-border text-parchment">
                    {locale === "es" ? "Cancelar" : "Cancel"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Collections list */}
      {collections.length === 0 ? (
        <div className="text-center py-12 text-ash">
          <Folder className="h-12 w-12 mx-auto mb-3 text-ash/50" />
          <p>{locale === "es" ? "No hay colecciones todavía" : "No collections yet"}</p>
        </div>
      ) : (
        collections.map((col) => (
          <Card key={col.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleExpand(col.id)}
                  className="flex items-center gap-2 flex-1 text-left hover:text-ember transition-colors"
                >
                  <Folder className="h-5 w-5 text-ember" />
                  <span className="font-medium text-parchment">{col.name}</span>
                  <Badge variant="outline" className="text-xs ml-2">
                    {col.items_count || 0} {locale === "es" ? "herramientas" : "tools"}
                  </Badge>
                  {expandedId === col.id ? (
                    <ChevronUp className="h-4 w-4 ml-auto text-ash" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-auto text-ash" />
                  )}
                </button>
              </div>

              {col.description && (
                <p className="text-sm text-ash mt-2 ml-7">{col.description}</p>
              )}

              {/* Expanded items */}
              {expandedId === col.id && (
                <div className="mt-4 ml-7">
                  {expandedItems.length === 0 ? (
                    <p className="text-sm text-ash">{locale === "es" ? "Colección vacía" : "Empty collection"}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {expandedItems.map(page => (
                        <div key={page.id} className="relative group">
                          <PageCard page={page} />
                          {user?.id === targetUserId && (
                            <button
                              onClick={() => handleRemoveItem(col.id, page.id)}
                              className="absolute top-2 right-2 p-1.5 bg-pitch/80 border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:border-red-500 hover:text-red-500"
                              title={locale === "es" ? "Quitar de colección" : "Remove from collection"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
