import api from "./api";
import axios from "axios";
export function getCompositions() {
  return api.get("/compositions");
}

export function getCompositionById(id) {
  return api.get(`/composition/${id}`);
}

export function getCompositionByIdFull(id) {
  return api.get(`/composition/${id}/full`);
}

export function getCompositionNotesheetsListById(id) {
  return api.get(`/composition/${id}/notesheets`);
}

export function saveComposition(data) {
  return api.post("/composition/update", data);
}

export function createComposition(data) {
  return api.post("/composition/create", data);
}
export function deleteComposition(id) {
  return api.post(`/composition/delete/${id}`);
}
