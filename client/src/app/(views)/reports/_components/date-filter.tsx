import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

export default function DateFilter({ filterBy, handleDateFilter }: any) {
  return (
    <div className="grid lg:grid-cols-2 items-center gap-4">
      <div className="flex gap-2 w-full">
        <div className="flex flex-col gap-3 w-full">
          <Label htmlFor="edited_start_date" className="px-1">
            Edited Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="edited_start_date"
                className="w-full justify-between font-normal"
              >
                {filterBy.edited_start_date
                  ? filterBy.edited_start_date
                  : "Select start date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={filterBy.edited_start_date}
                captionLayout="dropdown"
                onSelect={handleDateFilter("edited_start_date")}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Label htmlFor="edited_end_date" className="px-1">
            Edited End Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="edited_end_date"
                className="w-full justify-between font-normal"
              >
                {filterBy.edited_end_date
                  ? filterBy.edited_end_date
                  : "Select end date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={filterBy.edited_end_date}
                captionLayout="dropdown"
                onSelect={handleDateFilter("edited_end_date")}
                disabled={{
                  after: new Date(),
                  before: filterBy.edited_start_date,
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <div className="flex flex-col gap-3 w-full">
          <Label htmlFor="edited_transaction_start_date" className="px-1">
            Transaction Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="edited_transaction_start_date"
                className="w-full justify-between font-normal"
              >
                {filterBy.edited_transaction_start_date
                  ? filterBy.edited_transaction_start_date
                  : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={filterBy.edited_transaction_start_date}
                captionLayout="dropdown"
                onSelect={handleDateFilter("edited_transaction_start_date")}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Label htmlFor="edited_transaction_end_date" className="px-1">
            Transaction End Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="edited_transaction_end_date"
                className="w-full justify-between font-normal"
              >
                {filterBy.edited_transaction_end_date
                  ? filterBy.edited_transaction_end_date
                  : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={filterBy.edited_transaction_end_date}
                captionLayout="dropdown"
                onSelect={handleDateFilter("edited_transaction_end_date")}
                disabled={{
                  after: new Date(),
                  before: filterBy.edited_transaction_start_date,
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
