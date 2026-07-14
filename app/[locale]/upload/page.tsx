import { UploadForm } from "@/components/upload-form";
import { BatchUploadForm } from "@/components/batch-upload-form";
import { LocaleParams } from "@/types";

export default async function UploadPage({ params }: LocaleParams) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-5xl md:text-6xl text-parchment mb-8">
        {locale === "es" ? "SUBIR HERRAMIENTA" : "UPLOAD TOOL"}
      </h1>

      <div className="mb-10">
        <h2 className="font-heading text-2xl text-parchment mb-3">
          {locale === "es" ? "Subida múltiple" : "Batch upload"}
        </h2>
        <p className="text-ash mb-4">
          {locale === "es"
            ? "Selecciona varios archivos HTML y crea una herramienta por cada uno."
            : "Select multiple HTML files and create a tool for each one."}
        </p>
        <BatchUploadForm />
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="font-heading text-2xl text-parchment mb-3">
          {locale === "es" ? "Subida individual" : "Single upload"}
        </h2>
        <p className="text-ash mb-4">
          {locale === "es"
            ? "Sube un solo archivo con todos los detalles."
            : "Upload a single file with all details."}
        </p>
        <UploadForm />
      </div>
    </div>
  );
}
