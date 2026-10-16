type SidebarProps = {
  activeSection: "overview" | "records" | "reports";
  onNavigate: (
    section: "overview" | "records" | "reports"
  ) => void;
};

function Sidebar({
  activeSection,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          KCH
        </div>

        <div>
          <h2>KCH Contracts</h2>
          <p>Contract Management</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`sidebar-link ${
            activeSection === "overview"
              ? "active"
              : ""
          }`}
          onClick={() => onNavigate("overview")}
        >
          <span className="sidebar-icon">
            ◫
          </span>

          Overview
        </button>

        <button
          type="button"
          className={`sidebar-link ${
            activeSection === "records"
              ? "active"
              : ""
          }`}
          onClick={() => onNavigate("records")}
        >
          <span className="sidebar-icon">
            ▦
          </span>

          Records
        </button>

        <button
          type="button"
          className={`sidebar-link ${
            activeSection === "reports"
              ? "active"
              : ""
          }`}
          onClick={() => onNavigate("reports")}
        >
          <span className="sidebar-icon">
            ▥
          </span>

          Reports
        </button>
      </nav>

      <div className="sidebar-footer">
        <p>Development Prototype</p>
        <span>Fake data only</span>
      </div>
    </aside>
  );
}

export default Sidebar;