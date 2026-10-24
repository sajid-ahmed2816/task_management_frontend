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

  //Refresh trigger
  projectsRefreshKey: 0,
  workspacesRefreshKey: 0,
  refreshAllProjects: () => set((state) => ({
    projectsRefreshKey: state.projectsRefreshKey + 1,
  })),
  refreshWorkspaces: () => set((state) => ({
    workspacesRefreshKey: state.workspacesRefreshKey + 1,
  })),

  // All projects for TaskDialog
  allProjects: [],
  allProjectsLoading: false,
  allProjectsError: null,

  setAllProjects: (allProjects) => set({ allProjects }),
  setAllProjectsLoading: (allProjectsLoading) => set({ allProjectsLoading }),
  setAllProjectsError: (allProjectsError) => set({ allProjectsError }),
  // All projects for TaskDialog

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

  workspace: {},
  workspaces: [],
  workspacesLoading: false,
  workspacesError: null,

  setWorkspace: (workspace) => set(() => ({ workspace })),
  setWorkspaces: (workspaces) => set(() => ({ workspaces })),
  setWorkspacesLoading: (workspacesLoading) => set({ workspacesLoading }),
  setWorkspacesError: (workspacesError) => set({ workspacesError }),

}), {
  name: "app-storage",
  storage: createJSONStorage(() => localStorage)
}));

export default useStore;