import axios from "axios";

import api from "./api";

export function saveNotesheet(data) {
  return api.post("/notesheet/update", data);
}

export function deleteNotesheet(data) {
  return api.post("/notesheet/delete", data);
}
export function createNotesheet(data) {
  return api.post("/notesheet/create", data);
}
