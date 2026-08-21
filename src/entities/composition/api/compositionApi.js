import api from "@/shared/api/client";
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

export function saveCompositionFull(data) {
  return api.post("/composition/save", data);
}

export function createComposition(data) {
  return api.post("/composition/create", data);
}
export function deleteComposition(id) {
  return api.post(`/composition/delete/${id}`);
}

export function addBarPoint(compositionId, notesheetId, body) {
  return api.post(
    `/composition/${compositionId}/notesheet/${notesheetId}/bars`,
    body
  );
}

export function deleteBarPoint(compositionId, notesheetId, orderIndex) {
  return api.delete(
    `/composition/${compositionId}/notesheet/${notesheetId}/bars/${orderIndex}`
  );
}

export function upsertBeatPoint(
  compositionId,
  notesheetId,
  barOrder,
  beatOrder,
  beat
) {
  return api.put(
    `/composition/${compositionId}/notesheet/${notesheetId}/bars/${barOrder}/beats/${beatOrder}`,
    beat
  );
}

export function insertBeatPoint(compositionId, notesheetId, barOrder, body) {
  return api.post(
    `/composition/${compositionId}/notesheet/${notesheetId}/bars/${barOrder}/beats`,
    body
  );
}

export function deleteBeatPoint(
  compositionId,
  notesheetId,
  barOrder,
  beatOrder
) {
  return api.delete(
    `/composition/${compositionId}/notesheet/${notesheetId}/bars/${barOrder}/beats/${beatOrder}`
  );
}
