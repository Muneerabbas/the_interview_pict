"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const Login = () => {
  const { data: session } = useSession();

  return (
    <div className="text-center py-10">
      {session ? (
        <div>
          <p className="text-lg font-bold">Welcome, {session.user.name}!</p>
          <p className="text-sm text-gray-600">Email: {session.user.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p className="text-lg font-bold">Sign in with Google to continue!</p>
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
