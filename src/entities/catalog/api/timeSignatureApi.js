import api from "@/shared/api/client";

export function getTimeSignatures() {
  return api.get("/static/timeSignatures");
}

