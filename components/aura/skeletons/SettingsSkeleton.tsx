import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsSkeleton() {
  return (
    <div className="flex flex-col h-full w-full p-5 gap-6 animate-in fade-in">
      
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-3 w-64 rounded-md" />
      </div>

      {/* Card Plano Skeleton */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
            </div>

            {/* Simula o botão de CTA */}
            <Skeleton className="h-24 w-full rounded-2xl" />
      </div>

      {/* Card Conta Skeleton */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 space-y-4">
            <Skeleton className="h-5 w-32 rounded-md mb-2" />
            
            <div className="space-y-1">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>
      </div>

      {/* Footer Buttons Skeleton */}
      <div className="space-y-3 pt-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
      </div>

    </div>
  );
}