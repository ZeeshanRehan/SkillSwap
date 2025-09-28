"use client";

import { useEffect, useState } from "react";
import users from "@/data/users.json";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
  const { userId, setUserId } = useUser();
  const [selected, setSelected] = useState<string | undefined>(undefined);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (stored) setSelected(stored);
  }, []);

  const handleChange = (value: string) => {
    setSelected(value);
    setUserId(value);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Label htmlFor="user">Select user</Label>
        <Select value={selected} onValueChange={handleChange}>
          <SelectTrigger id="user" className="w-full">
            <SelectValue placeholder="Choose a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
