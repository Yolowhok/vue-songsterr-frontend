import axios from "axios";
import api from "./api";

export function getDurations() {
  return api.get("/static/durations");
}

// export function getDurations() {
//   return axios.get("http://localhost:8080/static/durations");
// }
