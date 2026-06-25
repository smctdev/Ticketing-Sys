import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import feelings from "@/data/feelings.json";
import { Dispatch, SetStateAction, useState } from "react";
import { PostFormInputType } from "../../_types/form-input-type";

export default function SelectableFeelings({
  setFormInput,
  formInput,
}: {
  setFormInput: Dispatch<SetStateAction<PostFormInputType>>;
  formInput: PostFormInputType;
}) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <Select
      onValueChange={(value) =>
        setFormInput((prev) => ({ ...prev, category: value }))
      }
      value={formInput.category}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="How are you feeling?" />
      </SelectTrigger>
      <SelectContent>
        <InputGroup className="w-full">
          <InputGroupInput
            placeholder="Search feelings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <SelectGroup>
          <SelectLabel>How are you feeling?</SelectLabel>
          {feelings
            ?.filter((item) =>
              item?.value
                ?.trim()
                ?.toLowerCase()
                ?.includes(searchTerm?.trim()?.toLowerCase()),
            )
            ?.map((feeling, index) => (
              <SelectItem value={feeling.value} key={index}>
                {feeling.label}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
