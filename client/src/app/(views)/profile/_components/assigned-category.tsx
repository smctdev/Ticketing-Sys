import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignedCategory({ categories }: any) {
  return (
    <div className="lg:col-span-1 space-y-6 w-full sticky top-0">
      <Card>
        <CardHeader>
          <CardTitle>Assigned Categories</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {categories?.length > 0 ? (
            categories?.map((category: any, index: number) => (
              <Badge variant="secondary" key={index}>
                {category?.category_group_code?.group_code}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500 w-full text-center">
              No assigned categories
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
