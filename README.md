# 🚀 Big-Hero-8-Meeting_Management-FE

## 📌 Quy tắc Coding

### 1️⃣ Tên file & thư mục
- **Component, Page, Layout** → PascalCase  
  👉 `UserTable.jsx`, `LoginPage.jsx`, `AdminLayout.jsx`  
- **Hooks** → `useTên`  
  👉 `useAuth.js`, `useFetch.js`  
- **Service** → tên entity  
  👉 `userService.js`, `meetingService.js`  

---

### 2️⃣ Component
- **Dumb component** (chỉ UI) → đặt trong `components/`
- **Smart component** (có logic, gọi API, state management) → đặt trong `pages/`
- Mỗi page chính sẽ sử dụng **layout** trong `layouts/`

---

### 3️⃣ API Services
Tạo một axios instance trong `services/api.js`:

```js
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", 
  headers: { "Content-Type": "application/json" }
});

export default api;
```

Ví dụ service cho user (`services/userService.js`):

```js
import api from "./api";

export const getUsers = () => api.get("/users");
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
```

---

### 4️⃣ Routes
Định nghĩa routes trong `routes/AppRoutes.jsx`:

```js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
```

Gọi trong `App.jsx`:

```js
import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
}

export default App;
```

---

### 5️⃣ Quy tắc chung
- ❌ Không gọi API trực tiếp trong component → ✅ luôn thông qua `services/`
- ❌ Không để state toàn cục lung tung → ✅ dùng `context/` hoặc Redux
- ✅ Format code bằng **ESLint + Prettier**
- ✅ Commit message chuẩn theo convention:
  - `feat: add login page`
  - `fix: bug in user table`
