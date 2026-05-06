import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

interface UserWithRole {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  role: "public" | "student" | "teacher" | "admin";
}

export function useUserWithRole() {
  const { data: session, isPending } = useSession();
  const [userWithRole, setUserWithRole] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.id) {
        setUserWithRole(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const userData = await res.json();
          setUserWithRole(userData);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [session?.user?.id]);

  return { user: userWithRole, loading: loading || isPending };
}
