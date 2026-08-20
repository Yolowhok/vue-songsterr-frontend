import api from "@/shared/api/client";

export function getDurations() {
  return api.get("/static/durations");
}

