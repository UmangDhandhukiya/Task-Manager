import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useDispatch } from "react-redux";
import { setUser, logoutUser } from "../appStore/authSlice";
import { useEffect } from "react";

export default function useAuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(logoutUser());
        return;
      }

      try {
        const token = await user.getIdToken();

        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("API error:", res.status);
          dispatch(setUser({ user: { uid: user.uid, email: user.email, name: user.displayName || "" }, role: "user" }));
          return;
        }

        const data = await res.json();

        dispatch(
          setUser({
            user: { uid: user.uid, email: user.email, name: data.user.name || user.displayName || "" },
            role: data?.user?.role,
          }),
        );
      } catch (err) {
        console.error("Auth restore failed", err);

        dispatch(setUser({ user, role: "user" }));
      }
    });

    return () => unsub();
  }, [dispatch]);
}
