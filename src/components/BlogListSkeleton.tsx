import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogListSkeleton() {
  return (
    <div className="min-h-screen py-12 px-4 bg-(--bg-primary)">
      <div className="container mx-auto max-w-6xl">
        {/* Title skeleton */}
        <div className="flex flex-col items-center mb-12">
          <Skeleton className="h-12 w-32 mb-4" />
          <Skeleton className="h-6 w-64" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full overflow-hidden bg-(--bg-secondary)">
              {/* Image skeleton */}
              <Skeleton className="h-48 w-full rounded-none" />

              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>

              <CardContent className="pb-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>

              <CardFooter className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-24 rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
