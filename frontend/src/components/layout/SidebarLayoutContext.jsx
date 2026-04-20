import { createContext, useContext } from "react";

const SidebarLayoutContext = createContext({
  isCollapsed: false,
  isSidebarCollapsed: false,
  setIsCollapsed: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});

export function SidebarLayoutProvider({ value, children }) {
  return (
    <SidebarLayoutContext.Provider value={value}>
      {children}
    </SidebarLayoutContext.Provider>
  );
}

export function useSidebarLayout() {
  return useContext(SidebarLayoutContext);
}
