import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#FDE8DF] dark:bg-[#2E1A16]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
