import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircleIcon, Loader2, Plus, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { TICKET_FORM_DATA } from "@/constants/ticket-form-data";
import { TicketFormDataType } from "@/types/ticket-form-data-type";
import formattedDateFull from "@/utils/format-date-full";
import { api } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicForm from "./basic-form";
import SqlForm from "./sql-form";

export function CreateTicket({
  categories,
  user,
  setTicketType,
  setIsRefreshCategories,
  branchHeads,
  setIsRefreshBranchHeads,
  fetchData,
}: any) {
  const [formInput, setFormInput] =
    useState<TicketFormDataType>(TICKET_FORM_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    setFormInput((formData) => ({
      ...formData,
      ticket_for: user?.branches[0]?.blist_id,
    }));
  }, [user]);

  useEffect(() => {
    if (formInput.ticket_category) {
      setFormInput((formData: any) => ({
        ...formData,
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
      setIsRefreshBranchHeads(true);
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

      if (formInput?.ticket_for) {
        formData.append("ticket_for", formInput.ticket_for);
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

      const response = await api.post("/submit-ticket", formData);
      if (response.status === 201) {
        const { ticket_for, ...ONLY_RESET } = TICKET_FORM_DATA;
        setError(null);
        setErrors({});
        setOpen(false);
        setFormInput((prev) => ({
          ...prev,
          ...ONLY_RESET,
        }));
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        fetchData();
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
      setIsRefreshBranchHeads(true);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
        >
          <Plus className="h-4 w-4" /> Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl flex flex-col">
        <form
          className="flex flex-col flex-1 gap-5 min-h-0"
          onSubmit={handleSubmit}
        >
          <DialogHeader>
            <DialogTitle>Create Ticket</DialogTitle>
          </DialogHeader>
          <Tabs
            value={formInput.ticket_type}
            onValueChange={handleChange("ticket_type")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="netsuite_ticket">Netsuite</TabsTrigger>
              <TabsTrigger value="sql_ticket">SQL</TabsTrigger>
            </TabsList>
            <div className="flex flex-col gap-4 max-h-[calc(100vh-270px)] overflow-y-auto min-h-0 flex-1 p-3">
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
                branchHeads={branchHeads}
              />
              {/* <TabsContent value="netsuite_ticket"></TabsContent>
              <TabsContent value="sql_ticket" className="space-y-4">
                <SqlForm
                  formInput={formInput}
                  errors={errors}
                  handleInputChange={handleInputChange}
                />
              </TabsContent> */}
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
                  <Loader2 className="animate-spin" /> Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
