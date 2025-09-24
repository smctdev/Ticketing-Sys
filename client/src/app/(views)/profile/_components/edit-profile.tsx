import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Storage from "@/utils/storage";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { PROFILE_FORM_ITEMS } from "../_constants/form-input";
import { ProfileFormInputType } from "../_types/form-input-type";
import nameShortHand from "@/utils/name-short-hand";
import { useAuth } from "@/context/auth-context";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface EditProfileProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  profile: any;
}

export default function EditProfile({
  open,
  setOpen,
  profile,
}: EditProfileProps) {
  const [formInput, setFormInput] =
    useState<ProfileFormInputType>(PROFILE_FORM_ITEMS);
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>(null);
  const { handleUpdateProfile } = useAuth();

  useEffect(() => {
    if (!profile && !open) return;
    setFormInput((formInput) => ({
      ...formInput,
      first_name: profile?.user_detail?.fname ?? "",
      last_name: profile?.user_detail?.lname ?? "",
      contact_number: profile?.user_detail?.user_contact ?? "",
      email: profile?.user_detail?.user_email ?? "",
      current_password: "",
      password: "",
      password_confirmation: "",
    }));

    setIsImageUploaded(false);
  }, [profile, open]);

  const handleChange =
    (title: string) => (e: ChangeEvent<HTMLInputElement>) => {
      let value;

      if (title === "profile_picture" && e.target.files) {
        setIsImageUploaded(true);
        value = e.target.files[0];
      } else {
        value = e.target.value;
      }
      setFormInput((formInput) => ({
        ...formInput,
        [title]: value,
      }));
    };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append("first_name", formInput.first_name);
      formData.append("last_name", formInput.last_name);
      formData.append("contact_number", formInput?.contact_number);
      formData.append("email", formInput.email);
      formData.append("current_password", formInput.current_password);
      formData.append("password", formInput.password);
      formData.append("password_confirmation", formInput.password_confirmation);
      if (isImageUploaded) {
        formData.append("profile_picture", formInput.profile_picture);
      }
      const response = await handleUpdateProfile(formData);
      if (response.status === 201) {
        setOpen(false);
        setIsImageUploaded(false);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setErrors(null);
        setFormInput(PROFILE_FORM_ITEMS);
      }
    } catch (error: any) {
      console.error(error);
      setErrors(error.response.data.errors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <div className="max-h-[700px] overflow-y-auto space-y-4">
          <div className="flex flex-col gap-2 px-4">
            <div className="font-bold text-gray-700 text-lg">
              Manage profile picture
            </div>
            <div className="w-full flex items-center gap-3 flex-col">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  alt={profile?.full_name}
                  src={
                    isImageUploaded
                      ? URL.createObjectURL(formInput.profile_picture)
                      : Storage(profile?.user_detail?.profile_pic)
                  }
                />
                <AvatarFallback className="font-bold text-5xl">
                  {nameShortHand(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                onClick={() => inputFileRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600"
                size={"sm"}
              >
                Edit profile
              </Button>
              <Input
                type="file"
                ref={inputFileRef}
                hidden
                onChange={handleChange("profile_picture")}
                accept="image/*"
              />
              {errors?.profile_picture && (
                <small className="text-red-500 text-sm">
                  {errors.profile_picture[0]}
                </small>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 px-4">
            <div className="font-bold text-gray-700 text-lg">
              Manage personal details
            </div>
            <div className="grid flex-1 auto-rows-min gap-2">
              <div className="grid gap-3">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  value={formInput.first_name}
                  onChange={handleChange("first_name")}
                />
                {errors?.first_name && (
                  <small className="text-red-500 text-sm">
                    {errors.first_name}
                  </small>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  value={formInput.last_name}
                  onChange={handleChange("last_name")}
                />
                {errors?.last_name && (
                  <small className="text-red-500 text-sm">
                    {errors.last_name}
                  </small>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="contact_number">Contact number</Label>
                <Input
                  type="number"
                  value={formInput.contact_number}
                  onChange={handleChange("contact_number")}
                />
                {errors?.contact_number && (
                  <small className="text-red-500 text-sm">
                    {errors.contact_number}
                  </small>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  value={formInput.email}
                  onChange={handleChange("email")}
                />
                {errors?.email && (
                  <small className="text-red-500 text-sm">{errors.email}</small>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 px-4 border-t py-4">
            <div className="font-bold text-gray-700 text-lg">
              Manage password
            </div>
            <div className="grid flex-1 auto-rows-min gap-2">
              <div className="grid gap-3">
                <Label htmlFor="current_password">Current password</Label>
                <Input
                  type="password"
                  placeholder="********"
                  onChange={handleChange("current_password")}
                />
                {errors?.current_password && (
                  <small className="text-red-500 text-sm">
                    {errors.current_password}
                  </small>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  placeholder="********"
                  onChange={handleChange("password")}
                />
                {errors?.password && (
                  <small className="text-red-500 text-sm">
                    {errors.password}
                  </small>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password_confirmation">
                  Password confirmation
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                  onChange={handleChange("password_confirmation")}
                />
              </div>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button
            onClick={handleSaveChanges}
            type="button"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save /> Save changes
              </>
            )}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
