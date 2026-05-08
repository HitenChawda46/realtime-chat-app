export type ApiError = {
  message: string;
};

export type SignUpData = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type ProfileData = { profilePic: string | ArrayBuffer };

export type User = {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
};
