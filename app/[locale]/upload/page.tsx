import { UploadForm } from "@/components/upload-form";
import { LocaleParams } from "@/types";

export default async function UploadPage({ params }: LocaleParams) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-5xl md:text-6xl text-parchment mb-8">
        {locale === "es" ? "SUBIR HERRAMIENTA" : "UPLOAD TOOL"}
      </h1>
      <UploadForm />
    </div>
  );
}
