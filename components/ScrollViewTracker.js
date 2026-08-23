"use client";

import { useMemo } from "react";
import ViewTracker from "@/components/ViewTracker";

export default function ScrollViewTracker({ id }) {
  const payload = useMemo(() => ({ id }), [id]);
  return <ViewTracker endpoint="/api/view" payload={payload} />;
}
