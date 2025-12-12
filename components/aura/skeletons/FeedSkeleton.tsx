import { Skeleton } from "@/components/ui/Skeleton";

export default function FeedSkeleton() {
  return (
    <div className="relative h-full w-full p-5 flex flex-col gap-6 overflow-hidden">
      
      {/* Header Skeleton */}
      <div className="space-y-2 shrink-0">
         <Skeleton className="h-8 w-40 rounded-lg" />
         <Skeleton className="h-3 w-64 rounded-md" />
      </div>

      {/* Formulário Skeleton */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 space-y-5 shrink-0">
          
          {/* Input Oferta */}
          <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-24 w-full rounded-2xl" />
          </div>

          {/* Input Frase */}
          <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Duração */}
          <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <div className="grid grid-cols-4 gap-2">
                  <Skeleton className="h-8 w-full rounded-xl" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                  <Skeleton className="h-8 w-full rounded-xl" />
              </div>
          </div>

          {/* Botão Gerar */}
          <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Área de Resultado Vazia Skeleton */}
      <div className="flex-1 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" />
      </div>

    </div>
  );
}