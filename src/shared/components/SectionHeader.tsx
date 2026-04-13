type SectionHeaderProps = {
  title: string;
  description: string;
};

export const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <div className="section-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
};
