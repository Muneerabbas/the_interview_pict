"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const Login = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const { email, name, image } = session.user;

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
        console.log(result.message);
      };

      saveUserData();
    }
  }, [session]);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-lg border border-white/20">
        {session ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <img
                src={session.user.image}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome back!
              </h2>
              <p className="text-xl font-semibold text-gray-700 mt-2">
                {session.user.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {session.user.email}
              </p>
            </div>

            <button
              onClick={() => signOut()}
              className="group relative w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 w-full h-full rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300"></span>
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1877F2] to-[#8B77F9] bg-clip-text text-transparent">
                Welcome
              </h2>
              <p className="text-gray-600">
                Sign in to share and view interview experiences
              </p>
            </div>

            <button
              onClick={() => signIn("google")}
              className="group relative w-full bg-white text-gray-700 rounded-xl py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />

                </svg>
                <span className="font-medium">Continue with Google</span>
              </div>
            </button>

            <div className="w-full flex items-center justify-center space-x-2">
  <div className="h-px w-16 bg-gray-300"></div>
  <span className="text-sm text-gray-500 whitespace-nowrap">Protected by Google</span>
  <div className="h-px w-16 bg-gray-300"></div>
</div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Login;