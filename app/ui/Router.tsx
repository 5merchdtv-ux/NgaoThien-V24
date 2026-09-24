"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_ROUTE,
  getRoute,
  routeIdFromPath,
  type RouteDef,
  type RouteId,
} from "@/lib/routes";

type RouterValue = {
  routeId: RouteId;
  route: RouteDef;
  navigate: (id: RouteId) => void;
};

const RouterContext = createContext<RouterValue | null>(null);

/**
 * Router nhẹ đồng bộ trang hiện tại với URL thật.
 * Dùng History API nên bấm Back/Forward của trình duyệt và tải lại trang
 * đều giữ đúng vị trí, đồng thời chia sẻ được link tới từng trang.
 *
 * Không dùng route segment của Next.js vì toàn bộ Dashboard nằm trong một
 * component có state dùng chung (dữ liệu tự làm mới mỗi 20 giây); tách thành
 * nhiều trang sẽ làm mất state đó mỗi lần chuyển trang.
 */
export function RouterProvider({ children }: { children: ReactNode }) {
  const [routeId, setRouteId] = useState<RouteId>(DEFAULT_ROUTE);

  useEffect(() => {
    const current = window.location.pathname;
    const resolved = routeIdFromPath(current);
    setRouteId(resolved);

    // Đường dẫn không khớp trang nào thì đưa URL về đúng trang đang hiển thị,
    // tránh để lại địa chỉ lạ trên thanh trình duyệt.
    const expected = getRoute(resolved).path;
    if ((current.replace(/\/+$/, "") || "/") !== expected) {
      window.history.replaceState({ routeId: resolved }, "", expected);
    }

    const onPopState = () => {
      setRouteId(routeIdFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((id: RouteId) => {
    setRouteId((current) => {
      if (current === id) return current;
      const next = getRoute(id);
      window.history.pushState({ routeId: id }, "", next.path);
      return id;
    });
  }, []);

  const value = useMemo<RouterValue>(
    () => ({ routeId, route: getRoute(routeId), navigate }),
    [routeId, navigate],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRoute(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) {
    throw new Error("useRoute phải được dùng bên trong RouterProvider.");
  }
  return value;
}
