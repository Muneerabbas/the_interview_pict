import { redirect } from "next/navigation";

export default function TalePostRedirectPage() {
  redirect("/post?type=tale");
}
