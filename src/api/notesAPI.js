import axios from "axios";
import api from "./api";

export function getNotes() {
  return api.get("/static/notes");
}

export function getOctaves() {
  return api.get("/static/octaves");
}

export function getNoteOctavesOrdered() {
  return api.get("/static/noteoctaves/ordered");
}
