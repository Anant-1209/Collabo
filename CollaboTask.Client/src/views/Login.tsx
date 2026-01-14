// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMsal } from "@azure/msal-react";
// import { loginRequest } from "../authConfig"; // You will create this file next

// export default function Login() {
//   const { instance } = useMsal();
//   const navigate = useNavigate();

//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // standard login logic (Dummy/Local)
//   const handleLogin = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await fetch("https://dummyjson.com/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: email,
//           password: password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       localStorage.setItem("token", data.token);
//       navigate("/dashboard");
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Microsoft SSO Login Implementation [cite: 17, 18, 21]
//   const handleSSOLogin = () => {
//     setError("");
//     setLoading(true);

//     instance
//       .loginPopup({
//         ...loginRequest,
//         prompt: "select_account",
//       })
//       .then((response) => {
//         // Store the JWT token for API authentication [cite: 234, 240]
//         localStorage.setItem("token", response.accessToken);
//         // Store user profile info [cite: 20]
//         localStorage.setItem("user", JSON.stringify(response.account));

//         navigate("/dashboard");
//       })
//       .catch((e) => {
//         setError("Microsoft Login failed: " + e.message);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   return (
//     <div className="min-h-screen w-full flex bg-[#1a1a2e] text-white">
//       {/* LEFT PANEL */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12">
//         <div className="w-full max-w-md">
//           <div className="flex items-center gap-2 mb-10">
//             <span className="w-3 h-3 rounded-full bg-[#007bff]" />
//             <span className="font-semibold text-lg">Collabo.</span>
//           </div>

//           <p className="text-sm text-gray-400 mb-2">Welcome back</p>
//           <h1 className="text-4xl font-bold mb-3">
//             Log in to your<br />account.
//           </h1>

//           <p className="text-sm text-gray-400 mb-8">
//             Not a member?{" "}
//             <span
//               onClick={() => navigate("/signup")}
//               className="text-[#007bff] cursor-pointer hover:underline"
//             >
//               Sign Up
//             </span>
//           </p>

//           {error && <p className="mb-4 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}

//           <div className="mb-5">
//             <label className="block text-sm mb-2">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="name@example.com"
//               className="w-full bg-[#252a40] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#007bff]/50"
//             />
//           </div>

//           <div className="mb-8 relative">
//             <label className="block text-sm mb-2">Password</label>
//             <input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter password"
//               className="w-full bg-[#252a40] rounded-lg px-4 py-3 pr-16 outline-none focus:ring-2 focus:ring-[#007bff]/50"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-4 top-11 text-sm text-gray-400"
//             >
//               {showPassword ? "Hide" : "Show"}
//             </button>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4">
//             <button
//               onClick={handleSSOLogin}
//               disabled={loading}
//               className="w-full sm:w-1/2 bg-[#2a2a3e] rounded-full py-3 text-sm flex items-center justify-center gap-2 hover:bg-[#35354e] transition active:scale-95 disabled:opacity-50"
//             >
//               {/* Optional: Add a Microsoft Icon here */}
//               Login with Microsoft
//             </button>

//             <button
//               onClick={handleLogin}
//               disabled={loading}
//               className="w-full sm:w-1/2 bg-[#007bff] rounded-full py-3 text-sm font-semibold hover:bg-[#0056b3] transition active:scale-95 disabled:opacity-50"
//             >
//               {loading ? "Processing..." : "Log In"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT PANEL (UI ONLY) */}
//       <div className="hidden lg:flex w-1/2 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-l-[140px] flex items-center justify-center">
//           <div className="text-center max-w-sm p-6">
//             <h2 className="text-4xl font-bold mb-4">Collaborate<br />Everywhere.</h2>
//             <p className="text-sm text-gray-300">
//               Access your team's workflow from anywhere in the world.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

export default function Login() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // standard login logic (Dummy/Local)
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Microsoft SSO Login & Database Sync
   * Requirement 2.1.1: User Authentication and Authorization [cite: 17, 18]
   */
  const handleSSOLogin = () => {
    setError("");
    setLoading(true);

    // Use loginRedirect instead of loginPopup to bypass COOP policy blocks
    instance.loginRedirect({
      ...loginRequest,
      prompt: "select_account",
    }).catch((e) => {
      setError("Microsoft Login failed: " + e.message);
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--bg-body)] text-[var(--text-primary)] transition-colors">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <span className="w-3 h-3 rounded-full bg-[#0066A1]" />
            <span className="font-semibold text-lg">CollaboTask</span>
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-2">Welcome back</p>
          <h1 className="text-4xl font-bold mb-3">Log in to your<br />account.</h1>

          <p className="text-sm text-[var(--text-secondary)] mb-8">
            Not a member?{" "}
            <span onClick={() => navigate("/signup")} className="text-[#0066A1] cursor-pointer hover:underline">
              Sign Up
            </span>
          </p>

          {error && <p className="mb-4 text-sm text-red-400 p-3 bg-red-400/10 rounded border border-red-400/20">{error}</p>}

          <div className="mb-5">
            <label className="block text-sm mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-[#0066A1] text-[var(--text-primary)]" placeholder="name@example.com" />
          </div>

          <div className="mb-8 relative">
            <label className="block text-sm mb-2">Password</label>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-[#0066A1] text-[var(--text-primary)]" placeholder="Enter password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-11 text-sm text-[var(--text-secondary)]">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex gap-4">
            <button onClick={handleSSOLogin} disabled={loading} className="w-1/2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-full py-3 text-sm flex items-center justify-center gap-2 hover:bg-[var(--bg-body)] transition-all">
              Login with Microsoft
            </button>
            <button onClick={handleLogin} disabled={loading} className="w-1/2 bg-[#0066A1] rounded-full py-3 text-sm font-semibold hover:bg-[#005585] text-white transition-all">
              {loading ? "..." : "Log In"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066A1] to-[#004d7a] rounded-l-[140px] flex items-center justify-center">
          <div className="text-center max-w-sm text-white">
            <h2 className="text-4xl font-bold mb-4">Collaborate<br />Everywhere.</h2>
            <p className="text-sm text-white/80">Access your team's workflow from anywhere in the world.</p>
          </div>
        </div>
      </div>
    </div>
  );
}