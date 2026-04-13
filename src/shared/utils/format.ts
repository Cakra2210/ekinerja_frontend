export const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));

export const getScoreLabel = (score: number) => {
  if (score >= 90) return "Istimewa";
  if (score >= 80) return "Sangat Baik";
  if (score >= 70) return "Baik";
  if (score >= 60) return "Cukup";
  return "Perlu Pembinaan";
};
