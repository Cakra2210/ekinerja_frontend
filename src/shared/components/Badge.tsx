type BadgeProps = {
  text: string;
  tone?: "neutral" | "success" | "warning";
};

export const Badge = ({ text, tone = "neutral" }: BadgeProps) => {
  return <span className={`badge badge-${tone}`}>{text}</span>;
};
