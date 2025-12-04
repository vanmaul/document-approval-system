import Image from "next/image";

import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root to the local login page so users land on the local app
  redirect("/login");
}
