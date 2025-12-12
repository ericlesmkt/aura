import React from "react";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // AQUI: Usamos a crase para juntar a classe padrão com a classe que vier nas props
      className={`animate-pulse rounded-md bg-white/5 ${className || ''}`}
      {...props}
    />
  );
}