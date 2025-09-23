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
import { useIsRefresh } from "@/context/is-refresh-context";
import { api } from "@/lib/api";
import formattedDateFull from "@/utils/format-date-full";
import { isImage } from "@/utils/image-format";
import { isApprovers, isAutomation } from "@/utils/is-approvers";
import Storage from "@/utils/storage";
import { Eye, FileSpreadsheet } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export function ViewTicketDetails({ data, open, setOpen }: any) {
  const { user } = useAuth();
  const role = user?.user_role?.role_name;
  const isYourPendingTicket = user?.login_id === data?.pending_user?.login_id;
  const [openImage, setOpenImage] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [image, setImage] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isCounted, setIsCounted] = useState<string>("");
  const [error, setError] = useState<any>(null);
  const TICKET_REJECTED = data?.status === TICKET_STATUS.REJECTED;
  const AUTOMATION_MANAGER =
    user?.user_role?.role_name === ROLE.AUTOMATION_MANAGER;
  const { setIsRefresh: refresh } = useIsRefresh();

  useEffect(() => {
    setNote(
      isAutomation(role)
        ? data?.ticket_detail?.td_note ?? ""
        : data?.ticket_detail?.td_note_bh ?? ""
    );
  }, [open]);

  const handleSelectImage = (specificItem: any, items: any[]) => () => {
    setImages(items);
    setImage(specificItem);
    setOpenImage(true);
  };

  const handleReviseTicket = () => {
    setOpen(false);
    Swal.fire({
      title: "Revise Ticket",
      text: `Are you sure you want to revise this ticket with ticket code of "${data?.ticket_code}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, revise it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        refresh(true);
        Swal.fire({
          title: "Revising...",
          text: "Please wait while the ticket is being revised...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const formData = isAutomation(role)
          ? {
              td_note: note,
            }
          : {
              td_note_bh: note,
            };

        try {
          const response = await api.patch(
            `/revise-ticket/${data?.ticket_details_id}/revise`,
            formData
          );
          if (response.status === 200) {
            setOpen(false);
            toast.success("Success", {
              description: response.data.message,
              position: "bottom-center",
            });
            setNote("");
            setError("");
            Swal.close();
          }
        } catch (error: any) {
          console.error(error);
          if (error.response.status === 422) {
            setError(error.response.data.errors);
            setOpen(true);
            Swal.close();
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong revising the ticket!",
            });
            setError("");
          }
        } finally {
          refresh(false);
        }
      } else {
        setOpen(true);
      }
    });
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNote(value);
  };

  const handleEditTicket = () => {
    setOpen(false);
    Swal.fire({
      title: "Mark as edit ticket",
      text: `Are you sure you want to mark as edit this ticket with ticket code of "${data?.ticket_code}"?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, mark as edit it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        refresh(true);
        Swal.fire({
          title: "Marking as edit...",
          text: "Please wait while the ticket is being marking as edit...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const formData = isAutomation(role)
          ? {
              td_note: note,
              is_counted: isCounted,
            }
          : {
              td_note_bh: note,
            };

        try {
          const response = await api.patch(
            `/mark-as-edited-ticket/${data?.ticket_details_id}/mark-as-edited`,
            formData
          );
          if (response.status === 200) {
            setOpen(false);
            toast.success("Success", {
              description: response.data.message,
              position: "bottom-center",
            });
            setNote("");
            setError("");
            setIsCounted("");
            Swal.close();
          }
        } catch (error: any) {
          console.error(error);
          if (error.response.status === 422) {
            setError(error.response.data.errors);
            setOpen(true);
            Swal.close();
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong revising the ticket!",
            });
            setError("");
          }
        } finally {
          refresh(false);
        }
      } else {
        setOpen(true);
      }
    });
  };

  console.log(isCounted);

  const handleApproveTicket = () => {
    setOpen(false);
    Swal.fire({
      title: "Approve Ticket",
      text: `Are you sure you want to approve this ticket with ticket code of "${data?.ticket_code}"?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        refresh(true);
        Swal.fire({
          title: "Approving...",
          text: "Please wait while the ticket is being approve...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const formData = isAutomation(role)
          ? {
              td_note: note,
            }
          : {
              td_note_bh: note,
            };

        try {
          const response = await api.patch(
            `/approve-ticket/${data?.ticket_details_id}/approve`,
            formData
          );
          if (response.status === 200) {
            setOpen(false);
            toast.success("Success", {
              description: response.data.message,
              position: "bottom-center",
            });
            setNote("");
            setError("");
            Swal.close();
          }
        } catch (error: any) {
          console.error(error);
          if (error.response.status === 422) {
            setError(error.response.data.errors);
            setOpen(true);
            Swal.close();
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong approving the ticket!",
            });
            setError("");
          }
        } finally {
          refresh(false);
        }
      } else {
        setOpen(true);
      }
    });
  };

  if (!open) return null;
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className="text-gray-700 text-lg">
                Viewing <span className="font-bold">{data?.ticket_code}</span>{" "}
                ticket from{" "}
                <span className="font-bold">
                  {data?.user_login.full_name} - {data?.branch_name}
                </span>
                ...
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-5">
            {data?.ticket_detail?.td_note_bh && (
              <div className="border p-2 flex flex-col gap-2 rounded-lg">
                <div className="text-gray-600 font-bold text-xl text-center">
                  Branch head note
                </div>
                <div className="text-sm">{data?.ticket_detail?.td_note_bh}</div>
              </div>
            )}
            {data?.ticket_detail?.td_note && (
              <div className="border p-2 flex flex-col gap-2 rounded-lg">
                <div className="text-gray-600 font-bold text-xl text-center">
                  Automation note
                </div>
                <div className="text-sm">{data?.ticket_detail?.td_note}</div>
              </div>
            )}
            {isApprovers(role) && isYourPendingTicket && (
              <>
                <div className="p-2 border rounded-lg flex flex-col gap-2">
                  <div className="text-gray-600 font-bold text-xl text-center">
                    Enter note
                  </div>
                  <div className="flex flex-col gap-1">
                    <Textarea
                      placeholder="Enter note"
                      value={note}
                      onChange={handleChange}
                    />

                    {(error?.td_note || error?.td_note_bh) && (
                      <small className="text-red-500">
                        {error?.td_note[0] || error?.td_note_bh[0]}
                      </small>
                    )}
                  </div>
                </div>
                {isAutomation(role) && !AUTOMATION_MANAGER && (
                  <div className="p-2 border rounded-lg flex flex-col gap-2">
                    <div className="text-gray-600 font-bold text-xl text-center">
                      Is Counted?
                    </div>
                    <div className="flex flex-col gap-1">
                      <Select value={isCounted} onValueChange={setIsCounted}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select is counted" />
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
                          {error?.is_counted[0]}
                        </small>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-evenly gap-2 items-center border rounded-lg p-2">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-600">
                  Transaction Date
                </span>
                <span className="text-sm">
                  {formattedDateFull(
                    data?.ticket_detail?.ticket_transaction_date
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-600">Ticket Category</span>
                <span className="text-sm">
                  {data?.ticket_detail?.ticket_category?.category_name}
                </span>
              </div>
            </div>
            {data?.ticket_detail?.td_support?.length > 0 && (
              <div className="flex flex-col gap-2 border rounded-lg">
                <div className="text-gray-600 font-bold p-2">Support Files</div>
                <div className="flex gap-2 overflow-x-auto w-full h-28 overflow-y-hidden px-2">
                  {data?.ticket_detail?.td_support?.map(
                    (file: any, index: number) => (
                      <div
                        key={index}
                        className="group relative rounded-md border"
                      >
                        <div className="p-2 w-20 h-20 rounded-md">
                          {isImage(file) ? (
                            <Image
                              src={Storage(file)}
                              alt={file}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileSpreadsheet className="w-full h-full" />
                          )}

                          <p className="text-xs truncate">
                            {file?.split("/").pop()}
                          </p>
                        </div>

                        <div className="w-20 h-full group-hover:block hidden bg-black/60 absolute top-0 rounded-md z-50">
                          <Button
                            type="button"
                            className="w-full p-0 h-full hover:bg-transparent bg-transparent"
                            onClick={handleSelectImage(
                              file,
                              data?.ticket_detail?.td_support
                            )}
                          >
                            <Eye className="w-full h-full" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            <div className="p-2 border rounded-lg flex flex-col gap-2">
              <div className="text-gray-600 font-bold text-xl text-center">
                Other details
              </div>
              <div className="flex justify-evenly gap-4">
                {data?.approve_head && (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-600">Approved By</span>
                    <span className="text-sm">
                      {data?.approve_head?.full_name}
                    </span>
                  </div>
                )}
                {data?.last_approver && (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-600">
                      Last Approver
                    </span>
                    <span className="text-sm">
                      {data?.last_approver?.full_name}
                    </span>
                  </div>
                )}
                {data?.assigned_person && (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-600">Assigned To</span>
                    <span className="text-sm">
                      {data?.assigned_person?.full_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
            {isApprovers(role) && isYourPendingTicket && !TICKET_REJECTED && (
              <>
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={handleReviseTicket}
                  className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
                >
                  Revise
                </Button>
                {isAutomation(role) && !AUTOMATION_MANAGER ? (
                  <Button
                    type="button"
                    variant={"outline"}
                    onClick={handleEditTicket}
                    className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
                  >
                    Mark as edited
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant={"outline"}
                    onClick={handleApproveTicket}
                    className="bg-green-500 hover:bg-green-600 text-white hover:text-white"
                  >
                    Approve
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={setOpenImage} open={openImage}>
        <DialogContent
          showCloseButton={false}
          className="bg-transparent border-none shadow-none sm:!max-w-sm md:!max-w-md lg:!max-w-lg xl:!max-w-xl 2xl:!max-w-2xl !h-fit"
        >
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
