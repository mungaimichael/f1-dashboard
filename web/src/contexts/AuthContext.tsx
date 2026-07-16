import { createContext, useContext, useMemo, ReactNode } from "react";
import { useQuery } from "@apollo/client/react";
import { VIEWER_AND_PERMISSIONS } from "../graphql/queries";
import { LoadingIcon } from "../components/LoadingIcon";

type Group = {
  id: string;
  label: string;
  roles: string[];
  pages: string[];
  actions: string[];
};

type Viewer = {
  actorId: string;
  contextId: string;
  roles: string[];
  userType: string;
};

type ViewerAndPermissionsData = {
  viewer: Viewer;
  uiPermissions: { groups: Group[] };
};

type AuthContextType = {
  actor: Viewer;
  groups: Group[];
  canAccessPage: (page: string) => boolean;
  can: (action: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, loading, error } = useQuery<ViewerAndPermissionsData>(
    VIEWER_AND_PERMISSIONS
  );

  const auth = useMemo(() => {
    if (!data) return null;

    const { viewer, uiPermissions } = data;

    // Match the user's JWT roles against each group's role list
    const myGroups = uiPermissions.groups.filter((group: Group) =>
      group.roles.some((r: string) => viewer.roles.includes(r))
    );

    // Union of all pages and actions across matched groups
    const allowedPages = new Set(myGroups.flatMap((g: Group) => g.pages));
    const allowedActions = new Set(myGroups.flatMap((g: Group) => g.actions));

    return {
      actor: viewer,
      groups: myGroups,
      canAccessPage: (page: string) => allowedPages.has(page),
      can: (action: string) => allowedActions.has(action)
    };
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingIcon />
        <span style={{ marginLeft: 8 }}>Loading identity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: 'var(--text)' }}>
        <h2>Identity Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
