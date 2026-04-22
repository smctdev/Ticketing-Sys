import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dateRangeFormat } from "@/utils/date-range-format";
import { CalendarIcon } from "lucide-react";

export default function DateFilter({ filterBy, handleDateFilter }: any) {
  return (
    <div className="grid md:grid-cols-3 items-center gap-4">
      <div className="flex gap-2 w-full">
        <div className="flex flex-col gap-3 w-full">
          <Label htmlFor="edited_date" className="px-1">
            Edited Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker-range"
                className="justify-start px-2.5 font-normal"
              >
                <CalendarIcon />
                {filterBy.edited_end_date ? (
                  filterBy.edited_end_date ? (
                    <>
                      {dateRangeFormat(filterBy.edited_start_date)} -{" "}
                      {dateRangeFormat(filterBy.edited_end_date)}
                    </>
                  ) : (
                    dateRangeFormat(filterBy.edited_start_date)
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={filterBy.edited_end_date}
                selected={{
                  from: filterBy.edited_start_date,
                  to: filterBy.edited_end_date,
                }}
                onSelect={(range) => {
                  handleDateFilter("edited_start_date")(range?.from);
                  handleDateFilter("edited_end_date")(range?.to);
                }}
                numberOfMonths={2}
                disabled={{
                  after: new Date(),
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <div className="flex flex-col gap-3 w-full">
          <Label htmlFor="edited_transaction_date" className="px-1">
            Transaction Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker-range"
                className="justify-start px-2.5 font-normal"
              >
                <CalendarIcon />
                {filterBy.edited_transaction_end_date ? (
                  filterBy.edited_transaction_end_date ? (
                    <>
                      {dateRangeFormat(filterBy.edited_transaction_start_date)}{" "}
                      - {dateRangeFormat(filterBy.edited_transaction_end_date)}
                    </>
                  ) : (
                    dateRangeFormat(filterBy.edited_transaction_start_date)
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={filterBy.edited_transaction_end_date}
                selected={{
                  from: filterBy.edited_transaction_start_date,
                  to: filterBy.edited_transaction_end_date,
                }}
                onSelect={(range) => {
                  handleDateFilter("edited_transaction_start_date")(
                    range?.from,
                  );
                  handleDateFilter("edited_transaction_end_date")(range?.to);
                }}
                numberOfMonths={2}
                disabled={{
                  after: new Date(),
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <div className="flex flex-col gap-3 w-full">
          <Label htmlFor="created_date" className="px-1">
            Created Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker-range"
                className="justify-start px-2.5 font-normal"
              >
                <CalendarIcon />
                {filterBy.created_end_date ? (
                  filterBy.created_end_date ? (
                    <>
                      {dateRangeFormat(filterBy.created_start_date)} -{" "}
                      {dateRangeFormat(filterBy.created_end_date)}
                    </>
                  ) : (
                    dateRangeFormat(filterBy.created_start_date)
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={filterBy.created_end_date}
                captionLayout="dropdown"
                selected={{
                  from: filterBy.created_start_date,
                  to: filterBy.created_end_date,
                }}
                onSelect={(range) => {
                  handleDateFilter("created_start_date")(range?.from);
                  handleDateFilter("created_end_date")(range?.to);
                }}
                numberOfMonths={2}
                disabled={{
                  after: new Date(),
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
