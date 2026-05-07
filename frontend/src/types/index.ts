export type SignUpData = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type ApiError = {
  message: string;
};
