import { FormInputGroupTypes } from "@/types/form-group";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function FormInputGroup({
  title = "",
  type = "text",
  error = "",
  value = "",
  onChange,
  placeholder = "",
  isOptional = false,
}: FormInputGroupTypes) {
  const titleUpperCaseFirst = title.slice(0, 1).toUpperCase() + title.slice(1);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={title.replace(/ /g, "_").toLowerCase()}>
        {titleUpperCaseFirst}
        {isOptional && <span className="text-gray-600 text-xs">(Optional)</span>}
      </Label>
      <div>
        <Input
          placeholder={placeholder}
          type={type}
          onChange={onChange}
          value={value}
        />
        {error && <small className="text-red-500">{error}</small>}
      </div>
    </div>
  );
}
