import { Skeleton } from "@/components/ui/Skeleton";

export default function LibrarySkeleton() {
  return (
    <div className="w-full rounded-2xl bg-[#121212] border border-white/5 p-4 flex gap-4">
      {/* Barra lateral de status */}
      <Skeleton className="w-1 h-full rounded-full" />

      <div className="flex-1 space-y-3">
        {/* Header (Badge + Status) */}
        <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
        </div>

        {/* Título */}
        <Skeleton className="h-5 w-3/4 rounded-md" />

        {/* Visual (Ícone + Texto) */}
        <div className="flex gap-2 items-center">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>

        {/* Footer (Data + Botão) */}
        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}