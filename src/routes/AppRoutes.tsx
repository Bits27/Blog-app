import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import CreateBlog from "../pages/CreateBlog";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import BlogDetail from "../pages/BlogDetail";
import AuthGuard from "../components/common/AuthGuard";
import Profile from "../pages/Profile";
import EditBlog from "../pages/EditBlog";


function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthGuard>
            <Home />
          </AuthGuard>
        }
      />
      <Route
        path="/create"
        element={
          <AuthGuard>
            <CreateBlog />
          </AuthGuard>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/logout"
        element={
          <AuthGuard>
            <Logout />
          </AuthGuard>
        }
      />
      <Route
        path="/blogs/:id"
        element={
          <AuthGuard>
            <BlogDetail />
          </AuthGuard>
        }
      />
      <Route
        path="/blogs/:id/edit"
        element={
          <AuthGuard>
            <EditBlog />
          </AuthGuard>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <AuthGuard>
            <Profile />
          </AuthGuard>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
