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
}: {
  links: PaginationLinksType[];
  handlePrevPage: () => void;
  handleNextPage: () => void;
  handleJumpToPage: (page: number | null) => void;
}) {
  return (
    <PaginationMain>
      <PaginationContent>
        {links?.map((link, index) => (
          <div key={index}>
            {link?.label?.toLocaleLowerCase().includes("previous") && (
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
            {link?.label?.toLocaleLowerCase().includes("next") && (
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
