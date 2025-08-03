import axios from "axios";

export function getDurations() {
  return axios.get("http://localhost:8080/static/durations");
}
