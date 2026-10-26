import { PAGE_COPY } from "@/config/page-copy";
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-linen border-t-gold" />
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-warm-gray">{PAGE_COPY.app_loading.loading}</p>
      </div>
    </div>
  );
}
