import type { User } from "@/types/models";

export const users: User[] = [
  {
    id: "u_anna",
    name: "Anna Sturm",
    email: "anna@sturm-drang.de",
    role: "owner",
    avatarColor: "bg-amber-200",
  },
  {
    id: "u_tobias",
    name: "Tobias Reinhardt",
    email: "tobias@sturm-drang.de",
    role: "member",
    avatarColor: "bg-sky-200",
  },
  {
    id: "u_lena",
    name: "Lena Hoffmann",
    email: "lena@sturm-drang.de",
    role: "member",
    avatarColor: "bg-emerald-200",
  },
];

export const currentUser = users[0]; // Demo runs as Anna

export function userById(id: string | undefined) {
  return users.find((u) => u.id === id);
}
