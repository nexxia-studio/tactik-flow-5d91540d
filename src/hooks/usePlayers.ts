import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Player = Tables<"players">;

export function usePlayers(teamId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["players", teamId],
    enabled: !!user && !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", teamId!)
        .order("last_name");
      if (error) throw error;
      return data as Player[];
    },
  });
}

export function useTeams() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teams"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useAddPlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (player: TablesInsert<"players">) => {
      const { data, error } = await supabase
        .from("players")
        .insert(player)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"players"> & { id: string }) => {
      const { data, error } = await supabase
        .from("players")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}
