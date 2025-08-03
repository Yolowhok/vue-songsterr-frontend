import axios from "axios";

import api from "./api";

export function getInstruments() {
  return api.get("/static/instruments");
}

// export function getInstruments() {
//   return axios.get("http://localhost:8080/static/instruments");
// }
