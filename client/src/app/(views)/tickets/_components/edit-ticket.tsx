import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { TICKET_FORM_DATA } from "@/constants/ticket-form-data";
import { TicketFormDataType } from "@/types/ticket-form-data-type";
import formattedDateFull from "@/utils/format-date-full";
import { api } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicForm from "./basic-form";

export function EditTicket({
  fetchData,
  ticketData,
  categories,
  user,
  setIsOpenDialog,
  open,
  setTicketType,
  setIsRefreshCategories,
  branchHeads,
  setIsRefreshBranchHeads,
}: any) {
  const [formInput, setFormInput] =
    useState<TicketFormDataType>(TICKET_FORM_DATA);
  const [oldFiles, setOldFiles] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOldFiles(
      ticketData?.ticket_detail?.td_support?.filter((item: any) => {
        if (formInput?.removed_file) {
          return !formInput?.removed_file.includes(item);
        }
      }),
    );
  }, [open, formInput.removed_file]);

  useEffect(() => {
    if (!open) return;
    setFormInput({
      ticket_transaction_date: formattedDateFull(
        ticketData.ticket_detail.ticket_transaction_date,
      ),
      ticket_category: String(ticketData.ticket_detail.ticket_category_id),
      ticket_support: TICKET_FORM_DATA.ticket_support,
      removed_file: TICKET_FORM_DATA.removed_file,
      ticket_for: String(ticketData.branch_id),
      ticket_type: ticketData.ticket_detail.ticket_type,
      purpose: ticketData.ticket_detail.td_purpose,
      from: ticketData.ticket_detail.td_from,
      to: ticketData.ticket_detail.td_to,
      ticket_reference_number: ticketData.ticket_detail.td_ref_number,
      branch_head_id: String(ticketData?.displayTicket),
    });

    setTimeout(() => {
      setFormInput((prev) => ({
        ...prev,
        ticket_sub_category: ticketData.ticket_detail.sub_category_id ?? "",
      }));
    }, 500);
  }, [open]);

  useEffect(() => {
    if (formInput.ticket_category) {
      setFormInput((prev: any) => ({
        ...prev,
        ticket_sub_category: "",
      }));
    }
  }, [formInput.ticket_category]);

  const handleInputChange =
    (title: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormInput((formData) => ({
        ...formData,
        [title]: value,
      }));
    };

  const handleChange = (title: string) => (value: string) => {
    const is_ticket_type = title === "ticket_type";
    setFormInput((formData) => ({
      ...formData,
      [title]: value,
    }));

    if (is_ticket_type) {
      setIsRefreshCategories(true);
      setTicketType(value);
      setFormInput((formData) => ({
        ...formData,
        ticket_category: "",
      }));
    }
  };

  const handleDateChange = (value: Date) => {
    setFormInput((formData) => ({
      ...formData,
      ticket_transaction_date: formattedDateFull(value),
    }));
  };

  const handleRemoveFile = (fileName: string) => () => {
    setFormInput((formData) => ({
      ...formData,
      removed_file: [...(formData.removed_file || []), fileName],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefreshBranchHeads(true);
    try {
      const formData = new FormData();
      formData.append(
        "ticket_transaction_date",
        formInput.ticket_transaction_date,
      );
      formData.append("ticket_category", formInput.ticket_category);
      formInput.ticket_support.forEach((support) => {
        formData.append("ticket_support[]", support);
      });

      if (formInput?.removed_file) {
        formInput.removed_file.forEach((file) => {
          formData.append("removed_file[]", file);
        });
      }

      if (formInput.ticket_type) {
        formData.append("ticket_type", formInput?.ticket_type);
      }

      if (formInput?.purpose) {
        formData.append("purpose", formInput.purpose);
      }

      if (formInput?.from) {
        formData.append("from", formInput.from);
      }

      if (formInput?.to) {
        formData.append("to", formInput.to);
      }

      if (formInput?.ticket_sub_category) {
        formData.append("ticket_sub_category", formInput.ticket_sub_category);
      }

      if (formInput?.ticket_reference_number) {
        formData.append(
          "ticket_reference_number",
          formInput.ticket_reference_number,
        );
      }

      if (formInput?.branch_head_id) {
        formData.append("branch_head_id", formInput.branch_head_id);
      }

      const response = await api.post(
        `/update-ticket/${ticketData.ticket_details_id}/update`,
        formData,
      );
      if (response.status === 200) {
        setError(null);
        setErrors({});
        setIsOpenDialog(false);
        setFormInput(TICKET_FORM_DATA);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        fetchData()
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 422) {
        setErrors(error.response.data.errors);
        setError(null);
      } else {
        setError(error.response.data.message);
        setErrors({});
      }
    } finally {
      setIsLoading(false);
      setIsRefreshBranchHeads(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    setFormInput((formData) => ({
      ...formData,
      ticket_support: [
        ...(formData.ticket_support || []),
        ...Array.from(files),
      ],
    }));
  };

  const handleRemoveAllFile = () => {
    setFormInput((formData) => ({
      ...formData,
      ticket_support: [],
      removed_file: oldFiles?.map((item: any) => item),
    }));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveSelectedFile = (key: number) => () => {
    setFormInput((formData) => ({
      ...formData,
      ticket_support: formData.ticket_support.filter(
        (_, index) => index !== key,
      ),
    }));

    setErrors((prevErrors: any) => {
      const newErrors: any = {};

      Object.entries(prevErrors).forEach(([errorKey, messages]) => {
        const match = errorKey.match(/^ticket_support\.(\d+)$/);

        if (match) {
          const index = parseInt(match[1], 10);

          if (index < key) {
            newErrors[`ticket_support.${index}`] = messages;
          } else if (index > key) {
            newErrors[`ticket_support.${index - 1}`] = messages;
          }
        } else {
          newErrors[errorKey] = messages;
        }
      });

      return newErrors;
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpenDialog}>
      <DialogContent className="sm:max-w-2xl flex flex-col">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Editing "{ticketData?.ticket_code}" ticket...
            </DialogTitle>
          </DialogHeader>
          <Tabs
            value={formInput.ticket_type}
            onValueChange={handleChange("ticket_type")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="netsuite_ticket">Netsuite</TabsTrigger>
              <TabsTrigger value="sql_ticket">SQL</TabsTrigger>
            </TabsList>
            <div className="flex flex-col gap-4 max-h-[calc(100vh-250px)] overflow-y-auto p-3">
              <BasicForm
                formInput={formInput}
                handleInputChange={handleInputChange}
                handleChange={handleChange}
                handleFileChange={handleFileChange}
                categories={categories}
                user={user}
                handleRemoveSelectedFile={handleRemoveSelectedFile}
                handleRemoveAllFile={handleRemoveAllFile}
                inputRef={inputRef}
                errors={errors}
                handleDateChange={handleDateChange}
                oldFiles={oldFiles}
                handleRemoveFile={handleRemoveFile}
                branchHeads={branchHeads}
              />
            </div>
            {error && (
              <div className="w-full">
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription className="max-h-30 overflow-y-auto">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </Tabs>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
