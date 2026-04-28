import {
  Pagination as PaginationMain,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationLinksType } from "@/types/use-fetch-type";

export function Pagination({
  links,
  handlePrevPage,
  handleNextPage,
  handleJumpToPage,
  isLoading,
  noData,
}: {
  links: PaginationLinksType[];
  handlePrevPage: () => void;
  handleNextPage: () => void;
  handleJumpToPage: (page: number | null) => void;
  isLoading: boolean;
  noData?: boolean;
}) {
  if (isLoading || noData) return null;

  return (
    <PaginationMain>
      <PaginationContent className="cursor-pointer">
        {links?.map((link, index) => (
          <div key={index}>
            {link?.label?.toLocaleLowerCase().includes("previous") &&
              link.page && (
                <PaginationItem>
                  <PaginationPrevious onClick={handlePrevPage} />
                </PaginationItem>
              )}
            {link?.label?.toLocaleLowerCase().includes("...") && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {link?.page &&
              !link?.label?.toLocaleLowerCase().includes("previous") &&
              !link?.label?.toLocaleLowerCase().includes("next") && (
                <PaginationItem>
                  <PaginationLink
                    isActive={link.active}
                    onClick={() => handleJumpToPage(link.page)}
                  >
                    {link?.label}
                  </PaginationLink>
                </PaginationItem>
              )}
            {link?.label?.toLocaleLowerCase().includes("next") && link.page && (
              <PaginationItem>
                <PaginationNext onClick={handleNextPage} />
              </PaginationItem>
            )}
          </div>
        ))}
      </PaginationContent>
    </PaginationMain>
  );
}
