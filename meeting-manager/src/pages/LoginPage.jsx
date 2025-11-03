import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import anhnen from "../assets/styles/anhnen.jpg";
import "../assets/styles/LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Khi component mount, kiểm tra xem user đã đăng nhập hay chưa
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      // Nếu đã có token + user, chuyển hướng theo role
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "STAFF") {
        navigate("/user");
      }
    }
  }, [navigate]);

  // Hàm kiểm tra email hợp lệ
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Xử lý đăng nhập
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
      const res = await login(email, password);

      if (res.accessToken && res.user) {
        const role = res.user.role;

        // ✅ Lưu dữ liệu đã có trong authService
        // ✅ Điều hướng theo role
        if (role === "ADMIN") {
          navigate("/admin");
        } else if (role === "STAFF") {
          navigate("/user");
        } else {
          navigate("/login");
        }
      } else {
        setError("Không nhận được token hoặc thông tin người dùng từ server.");
      }
    } catch (err) {
      setError(err.message || "Sai email hoặc mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Bên trái: hình nền */}
      <div
        className="left-side"
        style={{ backgroundImage: `url(${anhnen})` }}
      />

      {/* Bên phải: form đăng nhập */}
      <div className="right-side">
        <div className="form-wrapper">
          <h1 className="title">Đăng nhập</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Mật khẩu */}
            <div className="form-group">
              <label htmlFor="password" className="label">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={isLoading}
              className={`submit-button ${isLoading ? "loading" : ""}`}
            >
              {isLoading ? (
                <span className="loading-content">
                  <svg
                    className="spinner"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                      5.291A7.962 7.962 0 014 12H0c0 
                      3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Quên mật khẩu */}
          <div className="forgot-password">
            <a href="/ForgotPassWord" className="forgot-link">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
