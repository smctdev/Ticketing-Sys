import CarouselLayout from "@/components/carousel-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROLE } from "@/constants/roles";
import { TICKET_STATUS } from "@/constants/ticket-status";
import { useAuth } from "@/context/auth-context";
import formattedDateFull from "@/utils/format-date-full";
import { isImage } from "@/utils/image-format";
import {
  isAccountingApprover,
  isAccountingStaff,
  isApprovers,
  isAutomation,
  isAutomationManager,
} from "@/utils/is-approvers";
import Storage from "@/utils/storage";
import ticketTypeUpperCase from "@/utils/ticket-type-upper-case";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Hash,
  Layers,
  MessageCircleMore,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { InfoField, NoteCard } from "./view-ticket-details-items";
import { Spinner } from "@/components/ui/spinner";
import { CONFIG } from "@/config/config";
import Link from "next/link";
import statusColor from "@/utils/ticket-status-color";

export function ViewTicketDetails({
  data,
  open,
  setOpen,
  setNote,
  setIsCounted,
  role,
  error,
  isCounted,
  handleApproveTicket,
  handleEditTicket,
  handleReviseTicket,
  handleDirectToAutomation,
}: any) {
  const { user, isAdmin } = useAuth();
  const isYourPendingTicket = user?.login_id === data?.pending_user?.login_id;
  const isYourTicket = user?.login_id === data?.user_login?.login_id;
  const [openImage, setOpenImage] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [image, setImage] = useState<string>("");
  const TICKET_REJECTED = data?.status === TICKET_STATUS.REJECTED;
  const AUTOMATION_MANAGER =
    user?.user_role?.role_name === ROLE.AUTOMATION_MANAGER;
  const debounceRef = useRef<NodeJS.Timeout>(null);
  const [defaultNote, setDefaultNote] = useState<string>("");
  const [showNotes, setShowNotes] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setDefaultNote(
      isAutomationManager(role)
        ? (data?.ticket_detail?.td_note ?? "")
        : isAccountingStaff(role)
          ? (data?.ticket_detail?.td_note_accounting ?? "")
          : (data?.ticket_detail?.td_note_bh ?? ""),
    );
  }, [open, data]);

  const handleSelectImage = (specificItem: any, items: any[]) => () => {
    setImages(items);
    setImage(specificItem);
    setOpenImage(true);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDefaultNote(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setNote(value), 500);
  };

  const handleOpenChange = (value: boolean) => {
    setNote(defaultNote ?? "");
    setOpen(value);
  };

  const handleDownloadAsZip = (id: number) => () => {
    window.open(`${CONFIG.API_URL}/${id}/download-zip`, "_blank");
  };

  if (!data) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-8 pb-2">
            <DialogTitle className="sr-only">Ticket Not Found</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <X className="h-8 w-8 text-red-500 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-800">
                Ticket Not Found
              </p>
              <p className="text-sm text-muted-foreground">
                This ticket may have been deleted or no longer exists.
              </p>
            </div>
            <DialogClose asChild>
              <Button variant="outline" className="w-full rounded-lg mt-2">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {ticketTypeUpperCase(data?.ticket_detail?.ticket_type)}
                </span>
                <span className="text-base font-extrabold">
                  {data?.ticket_code}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(data?.status)}`}
                >
                  {data?.status}
                </span>
              </div>
              <p className="text-sm dark:text-white text-gray-500 font-normal">
                Submitted by{" "}
                <span className="font-semibold dark:text-white text-gray-700">
                  {data?.user_login?.full_name || "Deleted Account"}
                </span>{" "}
                · {data?.branch_name}
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[62vh] overflow-y-auto px-6 py-2 space-y-5">
            {(data?.ticket_detail?.td_note_accounting ||
              data?.ticket_detail?.td_note ||
              data?.ticket_detail?.td_note_bh) && (
              <Button
                className="w-full"
                onClick={() => setShowNotes(!showNotes)}
              >
                {showNotes ? "Hide" : "Show"} notes
              </Button>
            )}

            {showNotes && (
              <>
                {data?.ticket_detail?.td_note_accounting && (
                  <NoteCard
                    label="Accounting Note"
                    content={data.ticket_detail.td_note_accounting}
                  />
                )}

                {data?.ticket_detail?.td_note && (
                  <NoteCard
                    label="Automation Manager Note"
                    content={data.ticket_detail.td_note}
                  />
                )}

                {data?.ticket_detail?.td_note_bh && (
                  <NoteCard
                    label="Automation Note"
                    content={data.ticket_detail.td_note_bh}
                  />
                )}
              </>
            )}

            {(isApprovers(role) || !isAccountingApprover(role)) &&
              isYourPendingTicket &&
              !TICKET_REJECTED && (
                <div className="space-y-4">
                  {(isAutomationManager(role) ||
                    isAutomation(role) ||
                    isAccountingStaff(role)) && (
                    <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-sm">
                      <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide">
                        Add Note
                      </span>
                      <Textarea
                        placeholder="Write your note here..."
                        className="resize-none min-h-20 text-sm border-gray-200 focus-visible:ring-blue-400"
                        value={defaultNote}
                        onChange={handleChange}
                      />
                      {(error?.td_note ??
                        error?.td_note_bh ??
                        error?.td_note_accounting) && (
                        <small className="text-red-500">
                          {error?.td_note
                            ? error.td_note[0]
                            : error.td_note_bh
                              ? error.td_note_bh[0]
                              : error.td_note_accounting[0]}
                        </small>
                      )}
                    </div>
                  )}

                  {isAutomation(role) && !AUTOMATION_MANAGER && (
                    <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-sm">
                      <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide">
                        Is Counted?
                      </span>
                      <Select value={isCounted} onValueChange={setIsCounted}>
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Is Counted?</SelectLabel>
                            <SelectItem value="0">Yes</SelectItem>
                            <SelectItem value="1">No</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {error?.is_counted && (
                        <small className="text-red-500">
                          {error.is_counted[0]}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              )}

            {/* Ticket Info Grid */}
            <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
              <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide block mb-3">
                Ticket Information
              </span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoField
                  label="Transaction Date"
                  value={formattedDateFull(
                    data?.ticket_detail?.ticket_transaction_date,
                  )}
                  icon={<CalendarDays className="w-3 h-3" />}
                />
                <InfoField
                  label="Category"
                  value={data?.ticket_detail?.ticket_category?.category_name}
                  icon={<Tag className="w-3 h-3" />}
                />
                {data?.ticket_detail?.sub_category && (
                  <InfoField
                    label="Sub Category"
                    value={data.ticket_detail.sub_category.sub_category_name}
                    icon={<Layers className="w-3 h-3" />}
                  />
                )}
                {data?.ticket_detail?.td_ref_number && (
                  <InfoField
                    label="Reference Number"
                    value={data.ticket_detail.td_ref_number}
                    icon={<Hash className="w-3 h-3" />}
                  />
                )}
              </div>
            </div>

            {data?.ticket_detail?.td_support?.length > 0 && (
              <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide block mb-3">
                    Support Files
                  </span>
                  <Button
                    type="button"
                    size={"xs"}
                    onClick={handleDownloadAsZip(
                      data?.ticket_detail?.ticket_details_id,
                    )}
                    className="text-[10px] bg-blue-500 hover:bg-blue-600"
                  >
                    Download as Zip
                  </Button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {data.ticket_detail.td_support.map(
                    (file: any, index: number) => (
                      <div
                        key={index}
                        className="group relative shrink-0 w-20 h-20 rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
                        onClick={handleSelectImage(
                          file,
                          data.ticket_detail.td_support,
                        )}
                      >
                        {isImage(file) ? (
                          <Image
                            src={Storage(file)}
                            alt={file}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
                            <FileSpreadsheet className="w-8 h-8 dark:text-white text-gray-400" />
                            <p className="text-[10px] dark:text-white text-gray-500 truncate w-full text-center px-1">
                              {file?.split("/").pop()}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
              <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide block">
                Other Details
              </span>

              {(data?.approve_head ||
                data?.last_approver ||
                data?.assigned_person) && (
                <div className="flex flex-wrap gap-6">
                  {data?.approve_head && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved By
                      </span>
                      <span className="text-sm font-medium dark:text-white text-gray-700">
                        {data.approve_head.full_name}
                      </span>
                    </div>
                  )}
                  {data?.last_approver && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <User className="w-3 h-3" /> Approved By
                      </span>
                      <span className="text-sm font-medium dark:text-white text-gray-700">
                        {data.last_approver.full_name}
                      </span>
                    </div>
                  )}
                  {data?.assigned_person && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <Users className="w-3 h-3" /> Assigned To
                      </span>
                      <span className="text-sm font-medium dark:text-white text-gray-700">
                        {data.assigned_person.full_name}
                      </span>
                    </div>
                  )}
                  {data?.pending_user && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold dark:text-white text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <Spinner className="w-3 h-3" /> Pending With
                      </span>
                      <span className="text-sm font-medium dark:text-white text-gray-700">
                        {data.pending_user.full_name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {!Array.isArray(data?.ticket_detail?.td_purpose) &&
                  data?.ticket_detail?.td_purpose && (
                    <InfoField
                      label="Purpose"
                      value={data.ticket_detail.td_purpose}
                    />
                  )}
                {!Array.isArray(data?.ticket_detail?.td_from) &&
                  data?.ticket_detail?.td_from && (
                    <InfoField
                      label="From"
                      value={data.ticket_detail.td_from}
                    />
                  )}
                {!Array.isArray(data?.ticket_detail?.td_to) &&
                  data?.ticket_detail?.td_to && (
                    <InfoField label="To" value={data.ticket_detail.td_to} />
                  )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-lg md:w-auto w-full">
                Close
              </Button>
            </DialogClose>
            {(isYourTicket || isYourPendingTicket) && (
              <Link
                href={`/chats/${isYourTicket ? data?.pending_user?.login_id : data?.user_login?.login_id}?ticket_code=${data?.ticket_code}`}
                className="flex gap-1 text-blue-500 hover:text-blue-600"
              >
                <Button
                  type="button"
                  className="bg-chat-background hover:bg-chat-background/50"
                >
                  <MessageCircleMore /> Chat Now
                </Button>
              </Link>
            )}
            {(isApprovers(role) || isAccountingApprover(role)) &&
              isYourPendingTicket &&
              !TICKET_REJECTED && (
                <>
                  <Button
                    type="button"
                    onClick={handleReviseTicket(
                      data?.ticket_code,
                      data?.ticket_details_id,
                    )}
                    className="rounded-lg bg-red-500 hover:bg-red-600 text-white md:w-auto w-full"
                  >
                    Revise
                  </Button>
                  {isAutomation(role) && !AUTOMATION_MANAGER ? (
                    <Button
                      type="button"
                      onClick={handleEditTicket(
                        data?.ticket_code,
                        data?.ticket_details_id,
                      )}
                      className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white md:w-auto w-full"
                    >
                      Mark as Edited
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleApproveTicket(
                        data?.ticket_code,
                        data?.ticket_details_id,
                      )}
                      className="rounded-lg bg-green-500 hover:bg-green-600 text-white md:w-auto w-full"
                    >
                      Approve
                    </Button>
                  )}
                </>
              )}
            {isAdmin &&
              !isAutomation(data.pending_user.user_role.role_name) &&
              !isAutomationManager(data.pending_user.user_role.role_name) && (
                <Button
                  type="button"
                  onClick={handleDirectToAutomation(
                    data?.ticket_code,
                    data?.ticket_details_id,
                  )}
                  className="rounded-lg bg-green-500 hover:bg-green-600 text-white md:w-auto w-full"
                >
                  Direct To Automation
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setOpenImage} open={openImage}>
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
            <CarouselLayout images={images} image={image} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
