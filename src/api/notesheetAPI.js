import axios from "axios";

import api from "./api";

export function saveNotesheet(data) {
  return api.post("/notesheet/update", data);
}

export function deleteNotesheet(data) {
  return api.post("/notesheet/delete", data);
}

// export function saveNotesheet(data) {
//   return axios.post("http://localhost:8080/notesheet/update", data);
// }

// export function deleteNotesheet(data) {
//   return axios.post("http://localhost:8080/notesheet/delete", data);
// }
