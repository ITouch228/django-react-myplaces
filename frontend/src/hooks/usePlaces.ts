import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import type { Place, CreatePlaceData } from "../types";

// ===== QUERIES =====
export const usePlace = (id: number) => {
  return useQuery({
    queryKey: ["place", id],
    queryFn: () => api.get<Place>(`/api/places/${id}/`).then((res) => res.data),
    enabled: !!id,
  });
};

export const usePlaces = () => {
  return useQuery({
    queryKey: ["places"],
    queryFn: () => api.get<Place[]>("/api/places/").then((res) => res.data),
    staleTime: 60_000,
  });
};

// ===== MUTATIONS =====
export const useCreatePlace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlaceData) =>
      api.post<Place>("/api/places/", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
};

export const useDeletePlace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/places/${id}/`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
};
