import { useState } from "react";
import { login } from "../services/authService";
import anhnen from '../assets/styles/anhnen.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ (ví dụ: user@domain.com)");
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      window.location.href = "/dashboard"; // sau này nên dùng navigate()
    } catch (err) {
      setError("Sai email hoặc mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Left side: Background image */}
      <div
        className="hidden lg:flex lg:w-3/4 h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${anhnen})`,
        }}
      />

      {/* Right side: Login Form chiếm trọn 1/4 màn hình */}
      <div className="flex w-full lg:w-1/4 h-full items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full">
          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Đăng nhập
          </h1>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-6 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
