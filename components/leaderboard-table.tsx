"use client";

import { useState, useMemo } from "react";
import { User } from "@/types";
import { useLocale } from "@/components/locale-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Medal, ChevronLeft, ChevronRight, Trophy, Star, Zap } from "lucide-react";

const ROWS_PER_PAGE = 10;

const LEVEL_TITLES: Record<number, string> = {
  1: "Novato", 2: "Aprendiz", 3: "Practicante", 4: "Iniciado", 5: "Desarrollador",
  6: "Experto", 7: "Maestro", 8: "Arquitecto", 9: "Leyenda", 10: "Titán",
};

const LEVEL_COLORS: Record<number, string> = {
  1: "text-ash", 2: "text-ash", 3: "text-ash", 4: "text-ember", 5: "text-ember",
  6: "text-amber-500", 7: "text-amber-500", 8: "text-yellow-500", 9: "text-yellow-500", 10: "text-yellow-500",
};

interface LeaderboardTableProps {
  users: User[];
}

export function LeaderboardTable({ users }: LeaderboardTableProps) {
  const { messages } = useLocale();
  const t = messages.leaderboard;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / ROWS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return users.slice(start, start + ROWS_PER_PAGE);
  }, [users, currentPage]);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-void">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-medium text-ash">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-parchment">{t.dev}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-parchment">{t.points}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-parchment">{t.level}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedUsers.map((user, index) => {
              const globalIndex = (currentPage - 1) * ROWS_PER_PAGE + index;
              return (
                <tr key={user.id} className="bg-card hover:bg-void/50 transition-colors">
                  <td className="px-4 py-4">
                    {globalIndex < 3 ? (
                      <Medal
                        className={`h-5 w-5 ${
                          globalIndex === 0
                            ? "text-yellow-500"
                            : globalIndex === 1
                            ? "text-gray-300"
                            : "text-amber-600"
                        }`}
                      />
                    ) : (
                      <span className="text-ash">{globalIndex + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || ""} alt={user.name || "User avatar"} />
                        <AvatarFallback className="bg-void text-parchment">
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-parchment">{user.name}</p>
                        <p className="text-xs text-ash">{user.followers_count} {t.followers}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Badge variant="secondary" className="bg-ember/10 text-ember border border-ember/20">
                      {user.points.toLocaleString()}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={LEVEL_COLORS[user.level] || "text-parchment"}>
                        {LEVEL_TITLES[user.level] || `Nivel ${user.level}`}
                      </span>
                      <span className="text-xs text-ash">({user.level})</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-border text-parchment"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-ash px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-border text-parchment"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
