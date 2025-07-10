import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./config/ProtectedRoute";
import Loader from "./Components/Loader";

import Login from "./pages/Login";
import ErrorMaker from "./Components/ErrorMaker";

const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserLayouts = lazy(() => import("./layouts/UserLayouts"));
const AdminLayouts = lazy(() => import("./layouts/AdminLayouts"));

const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      {/* <ErrorMaker /> */}
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute role={"USER"} />}>
          <Route path="/dashboard" element={<UserLayouts />}>
            <Route index element={<UserDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role={"ADMIN"} />}>
          <Route path="/admin" element={<AdminLayouts />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
