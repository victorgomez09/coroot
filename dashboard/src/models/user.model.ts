export type User = {
  email: string;
  name: string;
  role: string;
  projects: {
    id: string;
    name: string;
  }[];
};
