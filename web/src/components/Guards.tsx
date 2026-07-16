import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ page, children }: { page: string; children: ReactNode }) {
  const auth = useAuth();

  if (!auth) return null;
  
  if (!auth.canAccessPage(page)) {
    return (
      <div style={{ padding: 24, color: 'var(--text-dim)', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8, margin: 16 }}>
        <p>You do not have permission to view the <strong>{page}</strong> page.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function IfCan({ action, children, fallback = null }: { action: string; children: ReactNode; fallback?: ReactNode }) {
  const { can } = useAuth();
  return can(action) ? <>{children}</> : <>{fallback}</>;
}
