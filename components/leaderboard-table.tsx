"use client";

import { User } from "@/types";
import { useLocale } from "@/components/locale-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";

interface LeaderboardTableProps {
  users: User[];
}

export function LeaderboardTable({ users }: LeaderboardTableProps) {
  const { messages } = useLocale();
  const t = messages.leaderboard;

  return (
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
          {users.map((user, index) => (
            <tr key={user.id} className="bg-card hover:bg-void/50 transition-colors">
              <td className="px-4 py-4">
                {index < 3 ? (
                  <Medal
                    className={`h-5 w-5 ${
                      index === 0
                        ? "text-yellow-500"
                        : index === 1
                        ? "text-gray-300"
                        : "text-amber-600"
                    }`}
                  />
                ) : (
                  <span className="text-ash">{index + 1}</span>
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
              <td className="px-4 py-4 text-right text-parchment">{user.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
