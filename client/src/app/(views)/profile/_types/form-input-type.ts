export interface ProfileFormInputType {
  profile_picture: File | any;
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface PostFormInputType {
  content: string;
  category: string;
}
