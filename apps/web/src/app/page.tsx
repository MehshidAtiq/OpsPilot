import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USE_API_DATA } from "@/lib/api/config";

export default async function Root() {
  if (USE_API_DATA) {
    const cookieStore = await cookies();
    if (!cookieStore.has("opspilot_session")) {
      redirect("/login");
    }
  }

  redirect("/dashboard");
}
