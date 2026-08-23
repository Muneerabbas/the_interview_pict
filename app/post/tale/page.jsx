import { redirect } from "next/navigation";
import { TALES_ENABLED } from "@/lib/feature-flags";

export default function TalePostRedirectPage() {
  redirect(TALES_ENABLED ? "/post?type=tale" : "/post");
}
