import axios from "axios";
import api from "./api";

export function getTunings() {
  return api.get("/static/tunings");
}

// export function getTunings() {
//   return axios.get("http://localhost:8080/static/tunings");
// }
