type StatsCardProps = {
  title: string;
  value: string | number;
  caption: string;
};

export const StatsCard = ({ title, value, caption }: StatsCardProps) => {
  return (
    <div className="stats-card">
      <span className="stats-label">{title}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </div>
  );
};
