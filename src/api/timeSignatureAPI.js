import axios from "axios";
import api from "./api";

export function getTimeSignatures() {
  return api.get("/static/timeSignatures");
}

// export function getTimeSignatures() {
//   return axios.get("http://localhost:8080/static/timeSignatures");
// }
