import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 h-[180px] flex flex-col justify-between">
      <div>
        {/* Avatar */}
        <Skeleton className="w-10 h-10 rounded-lg mb-4" />
        
        {/* Nome e Nicho */}
        <Skeleton className="h-6 w-2/3 mb-2 rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
      </div>

      {/* Footer (Cidade + Seta) */}
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
         <Skeleton className="h-3 w-24 rounded-md" />
         <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}