import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type TopbarProps = {
  children: ReactNode;
  welcomeText?: string | null;
};

export function Topbar({ children, welcomeText }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="brand">Inkframe</div>
      <div className="nav-links">
        {welcomeText ? <span className="meta welcome-text">{welcomeText}</span> : null}
        {children}
      </div>
    </div>
  );
}

type NavLinkPillProps = {
  to: string;
  children: ReactNode;
};

export function NavLinkPill({ to, children }: NavLinkPillProps) {
  return (
    <NavLink className={({ isActive }) => `link-pill${isActive ? " active" : ""}`} to={to}>
      {children}
    </NavLink>
  );
}
