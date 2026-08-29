import api from "@/lib/utils/axios";

// ⚠️ assumption: API response has no "status" (Published/Draft) field at all —
// only title, body, type, createdBy, createdAt, updatedAt. Confirm with backend
// if Draft/Publish is meant to exist; until then everything fetched is treated as live.

export interface AnnouncementAuthor {
  _id: string;
  name: string;
}

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  type: string; // e.g. "All" — audience. Confirm full list of allowed values with backend.
  createdBy: AnnouncementAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementPagination {
  page: number;
  limit: number;
  total: number;
  // ⚠️ assumption: screenshot cut off before showing the rest of "pagination" —
  // confirm exact keys (e.g. totalPages) once visible.
}

export interface AnnouncementListResponse {
  data: Announcement[];
  pagination: AnnouncementPagination;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  type: string;
}

export const announcementService = {
  // GET /announcement?page=&limit= -> list + pagination
  getAll: async (
    page: number = 1,
    limit: number = 20
  ): Promise<AnnouncementListResponse> => {
    const res = await api.get<AnnouncementListResponse>(
      `/announcement?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  // POST /announcement -> naya announcement create karna
  create: async (
    payload: CreateAnnouncementPayload
  ): Promise<ApiResponse<Announcement>> => {
    const res = await api.post<ApiResponse<Announcement>>(`/announcement`, payload);
    return res.data;
  },

  // PATCH /announcement/:id -> edit karna (⚠️ endpoint confirm karna, not seen in Postman yet)
  update: async (
    id: string,
    payload: Partial<CreateAnnouncementPayload>
  ): Promise<ApiResponse<Announcement>> => {
    const res = await api.patch<ApiResponse<Announcement>>(
      `/announcement/${id}`,
      payload
    );
    return res.data;
  },

  // DELETE /announcement/:id -> delete karna (⚠️ endpoint confirm karna, not seen in Postman yet)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/announcement/${id}`);
    return res.data;
  },
};