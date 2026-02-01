import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ScoreInput } from "@shared/routes";

export function useScores() {
  return useQuery({
    queryKey: [api.scores.list.path],
    queryFn: async () => {
      const res = await fetch(api.scores.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.scores.list.responses[200].parse(await res.json());
    },
  });
}

export function useSaveScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ScoreInput) => {
      const res = await fetch(api.scores.create.path, {
        method: api.scores.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Please log in to save your score");
        throw new Error("Failed to save score");
      }
      return api.scores.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scores.list.path] });
    },
  });
}
