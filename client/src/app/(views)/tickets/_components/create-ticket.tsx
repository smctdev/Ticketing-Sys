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
import {
  AlertCircleIcon,
  FileSpreadsheet,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { TICKET_FORM_DATA } from "@/constants/ticket-form-data";
import { TicketFormDataType } from "@/types/ticket-form-data-type";
import formattedDateFull from "@/utils/format-date-full";
import { api } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { formatFileSize } from "@/utils/formatFileSize";

export function CreateTicket({ setIsRefresh, categories, user }: any) {
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

  const handleInputChange =
    (title: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormInput((formData) => ({
        ...formData,
        [title]: value,
      }));
    };

  const handleChange = (title: string) => (value: string) => {
    setFormInput((formData) => ({
      ...formData,
      [title]: value,
    }));
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
    setIsRefresh(true);
    try {
      const formData = new FormData();
      formData.append(
        "ticket_transaction_date",
        formInput.ticket_transaction_date
      );
      formData.append("ticket_category", formInput.ticket_category);
      formInput.ticket_support.forEach((support) => {
        formData.append("ticket_support[]", support);
      });

      if (formInput?.ticket_for) {
        formData.append("ticket_for", formInput.ticket_for);
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
      setIsRefresh(false);
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
        (_, index) => index !== key
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
      <DialogContent className="sm:max-w-[425px]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Ticket</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="px-1">
                Transaction date
              </Label>
              <div className="relative flex gap-2">
                <Input
                  id="date"
                  value={formInput.ticket_transaction_date}
                  placeholder="June 01, 2025"
                  className="bg-background pr-10"
                  onChange={handleInputChange("ticket_transaction_date")}
                />
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      id="ticket_transaction_date"
                      variant="ghost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Transaction date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      required
                      selected={new Date(formInput.ticket_transaction_date)}
                      captionLayout="dropdown"
                      onSelect={handleDateChange}
                      disabled={{ after: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors?.ticket_transaction_date && (
                <small className="text-red-500">
                  {errors?.ticket_transaction_date[0]}
                </small>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="px-1">
                Ticket category
              </Label>
              <Select
                onValueChange={handleChange("ticket_category")}
                value={String(formInput.ticket_category)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ticket category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Select ticket category" disabled>
                      Select ticket category
                    </SelectItem>
                    {categories?.data?.length === 0 ? (
                      <SelectItem value="No ticket categories found">
                        No ticket categories found
                      </SelectItem>
                    ) : (
                      categories?.data?.map(
                        (ticket_category: any, index: number) => (
                          <SelectItem
                            key={index}
                            value={String(ticket_category.ticket_category_id)}
                          >
                            {ticket_category.category_name}
                          </SelectItem>
                        )
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors?.ticket_category && (
                <small className="text-red-500">
                  {errors?.ticket_category[0]}
                </small>
              )}
            </div>
            {user?.branches?.length > 1 && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="date" className="px-1">
                  Ticket For
                </Label>
                <Select
                  onValueChange={handleChange("ticket_for")}
                  value={String(formInput.ticket_for)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select ticket for" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Select ticket for" disabled>
                        Selec ticket for
                      </SelectItem>
                      {user?.branches?.length === 0 ? (
                        <SelectItem value="No branches found">
                          No branches found
                        </SelectItem>
                      ) : (
                        user?.branches?.map((branch: any, index: number) => (
                          <SelectItem
                            key={index}
                            value={String(branch.blist_id)}
                          >
                            {branch.b_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="px-1">
                Ticket support
              </Label>
              <Input
                type="file"
                ref={inputRef}
                multiple
                onChange={handleFileChange}
                hidden
              />
              <Button
                type="button"
                variant={"outline"}
                className="w-full border-blue-500 hover:border-blue-600 text-blue-500 hover:text-blue-600"
                onClick={() => inputRef?.current?.click()}
              >
                {formInput.ticket_support.length > 0
                  ? `Uploaded ${formInput.ticket_support.length} file(s)`
                  : "Upload file"}
              </Button>
              {formInput?.ticket_support?.length > 0 && (
                <>
                  <div>
                    <Button
                      type="button"
                      size={"sm"}
                      className="bg-red-500 hover:bg-red-600"
                      onClick={handleRemoveAllFile}
                    >
                      Remove all
                    </Button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto w-96 h-32 overflow-y-hidden">
                    {formInput.ticket_support.map(
                      (file: any, index: number) => (
                        <div
                          key={index}
                          className="group relative rounded-md border"
                        >
                          <div className="p-2 w-20 h-20 rounded-md">
                            {file?.type?.startsWith("image") ? (
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                width={30}
                                height={30}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileSpreadsheet className="w-full h-full" />
                            )}

                            <p className="text-xs truncate">{file.name}</p>
                            <p className="text-xs">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <div className="w-20 h-full group-hover:block hidden bg-black/60 absolute top-0 rounded-md z-50">
                            <Button
                              type="button"
                              className="w-full p-0 h-full hover:bg-transparent bg-transparent"
                              onClick={handleRemoveSelectedFile(index)}
                            >
                              <X className="w-full h-full" />
                            </Button>
                          </div>
                          {errors[`ticket_support.${index}`] && (
                            <small className="text-red-100 bg-red-900/80 text-xs absolute top-0 rounded-md h-full p-2 font-bold">
                              {errors[`ticket_support.${index}`][0]}
                            </small>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
              {errors?.ticket_support && (
                <small className="text-red-500">
                  {errors?.ticket_support[0]}
                </small>
              )}
            </div>
            {error && (
              <div className="w-full">
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
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
