import DataTableComponent from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { VIEW_DETAIL_COMLUMNS } from "../_constants/view-detail-columns";
import { ReturnToAutomation } from "./return-to-automation";
import { useState } from "react";
import { isCounted } from "@/utils/is-counted";
import { useAuth } from "@/context/auth-context";
import { ViewTicketDetails } from "../../tickets/_components/view-ticket-details";
import { api } from "@/lib/api";
import { Loader2, X } from "lucide-react";
import { IsForCounted } from "./is-for-counted";
import { EditNote } from "./edit-note";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import CarouselLayout from "@/components/carousel-layout";

export function ViewReportDetails({ data, open, setIsOpen }: any) {
  const [ticketCode, setTicketCode] = useState<string>("");
  const [isReturnOpen, setIsReturnOpen] = useState<boolean>(false);
  const [isForCountedOpen, setIsForCountedOpen] = useState<boolean>(false);
  const [noteValue, setNoteValue] = useState<string | undefined>("");
  const [isForEditNote, setIsForEditNote] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [selectedTicketData, setSelectedTicketData] = useState<any>(null);
  const [type, setType] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState<any>(false);
  const [isOpenImage, setOpenImage] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<any>([]);
  const { isAdmin } = useAuth();

  const VIEW_DETAIL_COMLUMNS_TICKET_CODE = [
    {
      name: "TICKET CODE",
      cell: (row: any) => (
        <>
          <button
            type="button"
            onClick={handleViewTicket(row.ticket_code)}
            className="text-blue-500 hover:text-blue-600 hover:underline font-bold"
          >
            {isLoading[row.ticket_code] ? (
              <>
                <Loader2 className="animate-spin" />
              </>
            ) : (
              row.ticket_code
            )}
          </button>

          {row.ticket_code === selectedTicketData?.ticket_code &&
            isViewDialogOpen && (
              <ViewTicketDetails
                data={selectedTicketData}
                open={isViewDialogOpen}
                setOpen={setIsViewDialogOpen}
                setNote={setNoteValue}
                handleDirectToAutomation={() => {}}
              />
            )}
        </>
      ),
    },
    {
      name: "ATTACHMENTS",
      cell: (row: any) =>
        row.ticket_detail.td_support.length > 0 && (
          <Button
            onClick={handleSelectImages(row.ticket_detail.td_support)}
            type="button"
            variant={"link"}
          >
            <Eye className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-pointer" />
          </Button>
        ),
    },
  ];

  const VIEW_DETAIL_COMLUMNS_ACTION = [
    {
      name: "ACTION",
      cell: (row: any) =>
        isAdmin ? (
          <div className="flex gap-2">
            <Button
              type="button"
              className="bg-blue-500 hover:bg-blue-600"
              size="xs"
              onClick={handleOpenDialog(row.ticket_code, "return")}
            >
              Return to automation
            </Button>
            <Button
              type="button"
              className={`${
                isCounted(row?.isCounted)
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-sky-500 hover:bg-sky-600"
              } `}
              size="xs"
              onClick={handleOpenDialog(
                row.ticket_code,
                "counted",
                isCounted(row?.isCounted)
                  ? "Mark as not counted"
                  : "Mark as counted",
              )}
            >
              {isCounted(row?.isCounted)
                ? "Mark as not counted"
                : "Mark as counted"}
            </Button>
            <Button
              type="button"
              onClick={handleOpenDialog(
                row.ticket_code,
                "note",
                row.ticket_detail.td_note_bh,
              )}
              className="bg-indigo-500 hover:bg-indigo-600"
              size="xs"
            >
              Edit note
            </Button>
          </div>
        ) : (
          "-"
        ),
      width: "500px",
    },
  ];

  const handleOpenDialog =
    (ticketCode: string, type: string, title?: string) => () => {
      setTicketCode(ticketCode);
      if (type === "return") {
        setIsReturnOpen(true);
      } else if (type === "counted") {
        setIsForCountedOpen(true);
        setType(title);
      } else if (type === "note") {
        setIsForEditNote(true);
        setNoteValue(title);
      }
    };

  const handleViewTicket = (id: any) => async () => {
    setIsLoading({ [id]: true });
    try {
      const response = await api.get(`/view-ticket/${id}/view`);
      if (response.status === 200) {
        setSelectedTicketData(response.data.data);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImages = (images: any) => () => {
    setSelectedImages(images);
    setOpenImage(true);
  };

  if (!open) return null;
  return (
    <>
      <Drawer open={open} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              <span className="dark:text-white text-gray-700 text-sm">
                Viewing{" "}
                <span className="font-bold">
                  {data.branch_name} - {data.branch_code}
                </span>{" "}
                ({data.ticket_count}) ticket(s)...
              </span>
            </DrawerTitle>
          </DrawerHeader>
          <DataTableComponent
            data={data.tickets}
            columns={[
              ...VIEW_DETAIL_COMLUMNS_TICKET_CODE,
              ...VIEW_DETAIL_COMLUMNS,
              ...VIEW_DETAIL_COMLUMNS_ACTION,
            ]}
            isPaginated={false}
            isFixedHeader={true}
          />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {isReturnOpen && (
        <ReturnToAutomation
          ticketCode={ticketCode}
          setOpen={setIsReturnOpen}
          open={isReturnOpen}
          setIsOpen={setIsOpen}
        />
      )}

      {isForCountedOpen && (
        <IsForCounted
          ticketCode={ticketCode}
          setOpen={setIsForCountedOpen}
          open={isForCountedOpen}
          setIsOpen={setIsOpen}
          type={type}
        />
      )}

      {isForEditNote && (
        <EditNote
          ticketCode={ticketCode}
          setOpen={setIsForEditNote}
          open={isForEditNote}
          setIsOpen={setIsOpen}
          noteValue={noteValue}
          setNoteValue={setNoteValue}
        />
      )}

      {isOpenImage && (
        <Dialog open={isOpenImage} onOpenChange={setOpenImage}>
          <DialogTrigger asChild>
            <Eye className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-pointer" />
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="bg-transparent border-none shadow-none sm:max-w-full h-fit!"
          >
            <Button
              type="button"
              onClick={() => setOpenImage(false)}
              className="absolute top-20 right-5 font-bold bg-transparent hover:bg-black/20"
            >
              <X className="text-white stroke-4" />
            </Button>
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <div className="p-10">
              <CarouselLayout images={selectedImages} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
