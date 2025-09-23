import { Search } from "lucide-react";
import { Input } from "./input";
import { ChangeEvent } from "react";

interface SearchInputProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

export default function SearchInput({ onChange, ...props }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search
        size={20}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <Input
        {...props}
        type="search"
        onChange={onChange}
        placeholder="Search..."
        className="pl-8 rounded-md"
      />
    </div>
  );
}
