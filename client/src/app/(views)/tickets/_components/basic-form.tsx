import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFileSize } from "@/utils/format-file-size";
import { isImage } from "@/utils/image-format";
import Storage from "@/utils/storage";
import { CalendarIcon, FileSpreadsheet, X } from "lucide-react";
import Image from "next/image";
import { Activity, useMemo } from "react";
import SqlForm from "./sql-form";

export default function BasicForm({
  formInput,
  handleInputChange,
  handleChange,
  handleFileChange,
  categories,
  user,
  handleRemoveSelectedFile,
  handleRemoveAllFile,
  inputRef,
  errors,
  handleDateChange,
  handleRemoveFile,
  oldFiles,
  branchHeads,
}: any) {
  const oldFilesLength = oldFiles?.length ?? 0;

  const ticketSubCategories = useMemo(() => {
    return categories?.data?.find(
      (category: any) =>
        Number(category.ticket_category_id) ===
        Number(formInput.ticket_category),
    )?.sub_categories;
  }, [formInput.ticket_category]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <Label htmlFor="ticket_transaction_date" className="px-1">
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
        <Label htmlFor="ticket_category" className="px-1">
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
                categories?.data?.map((ticket_category: any, index: number) => (
                  <SelectItem
                    key={index}
                    value={String(ticket_category.ticket_category_id)}
                  >
                    {ticket_category.category_name}{" "}
                    {ticket_category.sub_categories_count > 0 && (
                      <>
                        (
                        <span className="font-bold text-xs">
                          Sub Categories: {ticket_category.sub_categories_count}
                        </span>
                        )
                      </>
                    )}
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors?.ticket_category && (
          <small className="text-red-500">{errors?.ticket_category[0]}</small>
        )}
      </div>
      {ticketSubCategories?.length > 0 && (
        <div className="flex flex-col gap-3">
          <Label htmlFor="ticket_sub_category" className="px-1">
            Ticket sub category
          </Label>
          <Select
            onValueChange={handleChange("ticket_sub_category")}
            value={String(formInput.ticket_sub_category)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select ticket category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Select ticket category" disabled>
                  Select ticket category
                </SelectItem>
                {ticketSubCategories?.length === 0 ? (
                  <SelectItem value="No ticket categories found">
                    No ticket categories found
                  </SelectItem>
                ) : (
                  ticketSubCategories?.map(
                    (sub_category: any, index: number) => (
                      <SelectItem key={index} value={String(sub_category.id)}>
                        {sub_category.sub_category_name}
                      </SelectItem>
                    ),
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.ticket_sub_category && (
            <small className="text-red-500">
              {errors?.ticket_sub_category[0]}
            </small>
          )}
        </div>
      )}
      <Activity mode={branchHeads?.length > 1 ? "visible" : "hidden"}>
        <div className="flex flex-col gap-3">
          <Label htmlFor="branch_head_id" className="px-1">
            Branch Head
          </Label>
          <Select
            onValueChange={handleChange("branch_head_id")}
            value={String(formInput.branch_head_id)}
          >
            <SelectTrigger className="w-full min-h-15">
              <SelectValue placeholder="Select branch head" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select branch head</SelectLabel>
                {branchHeads?.length === 0 ? (
                  <SelectItem value="No branch heads found">
                    No branch heads found
                  </SelectItem>
                ) : (
                  branchHeads?.map((branchHead: any, index: number) => (
                    <SelectItem key={index} value={String(branchHead.login_id)}>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold">
                          {branchHead.full_name}
                        </span>
                        <span className="italic text-xs">
                          {branchHead.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.branch_head_id && (
            <small className="text-red-500">{errors?.branch_head_id[0]}</small>
          )}
        </div>
      </Activity>
      <SqlForm
        formInput={formInput}
        errors={errors}
        handleInputChange={handleInputChange}
      />
      <div className="flex flex-col gap-3">
        <Label htmlFor="ticket_reference_number" className="px-1">
          Ticket Reference #
        </Label>
        <Input
          value={formInput.ticket_reference_number ?? ""}
          className="w-full"
          placeholder="Ticket Reference #"
          onChange={handleInputChange("ticket_reference_number")}
        />
        {errors?.ticket_reference_number && (
          <small className="text-red-500">
            {errors?.ticket_reference_number[0]}
          </small>
        )}
      </div>
      {user?.branches?.length > 1 && (
        <div className="flex flex-col gap-3">
          <Label htmlFor="ticket_for" className="px-1">
            Ticket for what branch?
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
                    <SelectItem key={index} value={String(branch.blist_id)}>
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
        <Label htmlFor="ticket_support" className="px-1">
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
          {formInput.ticket_support.length + oldFilesLength > 0
            ? `Uploaded ${
                formInput.ticket_support.length + oldFilesLength
              } file(s)`
            : "Upload file"}
        </Button>
        {formInput?.ticket_support?.length + oldFilesLength > 0 && (
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
            <div className="flex gap-2 overflow-x-auto overflow-y-hidden h-32">
              {oldFilesLength > 0 &&
                oldFiles?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="group relative rounded-md border shrink-0 w-20 h-full"
                  >
                    <div className="p-2 w-20 h-20 rounded-md">
                      {isImage(item) ? (
                        <Image
                          src={Storage(item)}
                          alt={item}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileSpreadsheet className="w-full h-full" />
                      )}

                      <p className="text-xs truncate">{item.split("/")[1]}</p>
                    </div>
                    <div className="w-20 h-full group-hover:block hidden bg-black/60 absolute top-0 rounded-md z-50">
                      <Button
                        type="button"
                        className="w-full p-0 h-full hover:bg-transparent bg-transparent"
                        onClick={handleRemoveFile(item)}
                      >
                        <X className="w-full h-full" />
                      </Button>
                    </div>
                  </div>
                ))}
              {formInput.ticket_support.map((file: any, index: number) => (
                <div
                  key={index}
                  className="group relative rounded-md border shrink-0 w-20 h-full"
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
                    <p className="text-xs">{formatFileSize(file.size)}</p>
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
              ))}
            </div>
          </>
        )}
        {errors?.ticket_support && (
          <small className="text-red-500">{errors?.ticket_support[0]}</small>
        )}
      </div>
    </>
  );
}
