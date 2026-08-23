"use client";

import { useMemo } from "react";
import ViewTracker from "@/components/ViewTracker";

export default function ProfileViewTracker({ email }) {
  const payload = useMemo(() => ({ email }), [email]);
  return <ViewTracker endpoint="/api/profile/view" payload={payload} />;
}
