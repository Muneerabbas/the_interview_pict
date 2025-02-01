"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const Login = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const { email, name, image } = session.user;

      // Send user data to backend to save or update
      const saveUserData = async () => {
        const response = await fetch("/api/saveUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gmail: email,
            name,
            image,
        
          }),
        });
        const result = await response.json();
        console.log(result.message); // Handle success or failure
      };

      saveUserData();
    }
  }, [session]);

  return (
    <div className="text-center py-10">
      {session ? (
        <div>
          <p className="text-lg font-bold">Welcome, {session.user.name}!</p>
          <p className="text-sm text-gray-600">Email: {session.user.email}</p>
          <img
            src={session.user.image}
            alt="Profile"
            className="mx-auto mt-4 w-16 h-16 rounded-full"
          />
          <button
            onClick={() => signOut()}
            className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p className="text-lg font-bold">Sign in to continue!</p>
          <button
            onClick={() => signIn("google")}
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Sign In with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
