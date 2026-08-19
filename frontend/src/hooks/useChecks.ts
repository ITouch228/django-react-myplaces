import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import type {
  Check,
  CheckItem,
  CreateCheckData,
  CreateCheckItemData,
} from "../types";

// Check
export const useCreateCheck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCheckData) =>
      api.post("/api/checks/", data).then((res) => res.data),
    onSuccess: (newCheck) => {
      queryClient.invalidateQueries({
        queryKey: ["checks", { place: newCheck.place }],
      });
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["place", newCheck.place] });
    },
  });
};

export const useUpdateCheck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateCheckData>;
    }) => api.put<Check>(`/api/checks/${id}/`, data).then((res) => res.data),
    onSuccess: (updatedCheck) => {
      queryClient.invalidateQueries({
        queryKey: ["checks", { place: updatedCheck.place }],
      });
      queryClient.invalidateQueries({
        queryKey: ["place", updatedCheck.place],
      });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
};

export const useDeleteCheck = (placeId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkId: number) =>
      api.delete(`/api/checks/${checkId}/`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checks", { place: placeId }],
      });
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });
};

// CheckItem
export const useAddCheckItem = (placeId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      checkId,
      item_name,
      price,
      rating,
    }: {
      checkId: number;
      item_name: string;
      price: number;
      rating: number;
    }) =>
      api
        .post(`/api/checks/${checkId}/add_item/`, { item_name, price, rating })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checks", { place: placeId }],
      });
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    },
  });
};

export const useUpdateCheckItem = (placeId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateCheckItemData>;
    }) =>
      api
        .patch<CheckItem>(`/api/check-items/${id}/`, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checks", { place: placeId }],
      });
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    },
  });
};

export const useDeleteCheckItem = (placeId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) =>
      api.delete(`/api/check-items/${itemId}/`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checks", { place: placeId }],
      });
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    },
  });
};
