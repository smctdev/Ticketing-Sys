import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignedBranch({ branches }: any) {
  return (
    <div className="lg:col-span-1 space-y-6 w-full sticky top-0">
      <Card>
        <CardHeader>
          <CardTitle>Assigned Branches</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {branches?.length > 0 ? (
            branches?.map((branch: any, index: number) => (
              <Badge variant="secondary" key={index}>
                {branch?.branch?.b_code}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500 w-full text-center">
              No assigned branches
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
