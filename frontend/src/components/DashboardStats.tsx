type DashboardStatsProps = {
  totalContracts: number;
  activeContracts: number;
  startingWithinSixWeeks: number;
};

function DashboardStats({
  totalContracts,
  activeContracts,
  startingWithinSixWeeks,
}: DashboardStatsProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card total">
        <p>Total Contracts</p>
        <h2>{totalContracts}</h2>
      </div>

      <div className="stat-card active">
        <p>Active</p>
        <h2>{activeContracts}</h2>
      </div>

      <div className="stat-card starting">
        <p>Starting Within 6 Weeks</p>
        <h2>{startingWithinSixWeeks}</h2>
      </div>
    </div>
  );
}

export default DashboardStats;