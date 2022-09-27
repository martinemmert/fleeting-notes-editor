import { Route, Router, Routes } from "@solidjs/router";
import { lazy } from "solid-js";
import { AuthGuard } from "../container/auth-guard";
import EditorView from "../views/editor";

// const LazyEditorView = lazy(async () => import("../views/editor"));
const LazyLoginView = lazy(async () => import("../views/login"));

export const MainRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" component={AuthGuard}>
          <Route path="/" component={EditorView} />
        </Route>
        <Route path="/auth/login" component={LazyLoginView} />
      </Routes>
    </Router>
  );
};
