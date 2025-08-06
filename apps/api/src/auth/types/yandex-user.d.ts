export type YandexUser = {
  first_name: string;
  last_name: string;
  display_name: string;
  emails: string[];
  default_email: string;
  default_phone: {
    id: number;
    number: string;
  };
  real_name: string;
  is_avatar_empty: boolean;
  birthday: string;
  default_avatar_id: string;
  login: string;
  old_social_login: string;
  sex: string;
  id: string;
  client_id: string;
  psuid: string;
};
