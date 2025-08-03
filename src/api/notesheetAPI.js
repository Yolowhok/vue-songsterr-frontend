import axios from "axios";

export function saveNotesheet(data) {
  return axios.post("http://localhost:8080/notesheet/update", data);
}

export function deleteNotesheet(data) {
  return axios.post("http://localhost:8080/notesheet/delete", data);
}
