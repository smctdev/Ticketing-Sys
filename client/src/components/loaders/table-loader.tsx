import { Skeleton } from "../ui/skeleton";

export default function TableLoader({ colSpan }: any) {
  return (
    <>
      <div className="flex w-full flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className="w-full h-10"
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: "1.5s",
            }}
          ></Skeleton>
        ))}
      </div>
    </>
  );
}
