import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useStore = create(persist((set) => ({
  //Token
  token: JSON.parse(localStorage.getItem("user"))?.token,

  //Projects for task dialog
  projects: [],
  projectsLoading: false,
  projectsError: null,

  setProjects: (projects) => set({ projects }),
  setProjectsLoading: (projectsLoading) => set({ projectsLoading }),
  setProjectsError: (projectsError) => set({ projectsError }),
  //Projects for task dialog

  //Projects module filter
  projectsPage: 0,
  projectsRowsPerPage: 10,
  projectSearch: "",
  projectsFilters: {
    startDate: "",
    dueDate: "",
    status: [],
    priority: [],
  },

  setProjectsPage: (projectsPage) => set({ projectsPage }),
  setProjectsRowsPerPage: (projectsRowsPerPage) => set({ projectsRowsPerPage, projectsPage: 0 }),
  setProjectSearch: (projectSearch) => set({ projectSearch }),
  setProjectsFilters: (newFilters) => set((state) => ({
    projectsFilters: {
      ...state.projectsFilters,
      ...newFilters,
    },
  })),

  resetProjectsFilters: () => set({
    projectsFilters: {
      startDate: "",
      dueDate: "",
      status: [],
      priority: [],
    },
  }),
  //Projects module filter

  //Drawer
  isDrawerOpen: true,
  setIsDrawerOpen: (value) => set({ isDrawerOpen: value }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

}), {
  name: "app-storage",
  storage: createJSONStorage(() => localStorage)
}));

export default useStore;