import { useMemo, useState } from "react";
import { BerakhlakEvaluation, BerakhlakPayload } from "@/features/berakhlak/api/berakhlakApi";

type DimensionSummary = {
  pelayananAvg: number;
  akuntabelAvg: number;
  kompetenAvg: number;
  harmonisAvg: number;
  loyalAvg: number;
  adaptifAvg: number;
  kolaboratifAvg: number;
  finalScore: number;
};

type FormFieldKey = keyof BerakhlakPayload;

const SCORE_FIELDS: Array<keyof BerakhlakPayload> = [
  "pelayananResponsif",
  "pelayananRamah",
  "pelayananSolutif",
  "akuntabelProsedur",
  "akuntabelTransparansi",
  "akuntabelTanggungJawab",
  "kompetenPenguasaan",
  "kompetenPenyelesaian",
  "kompetenPengembangan",
  "harmonisTim",
  "harmonisRelasi",
  "harmonisLingkungan",
  "loyalKomitmen",
  "loyalAturan",
  "loyalDedikasi",
  "adaptifPerubahan",
  "adaptifFleksibilitas",
  "adaptifBelajar",
  "kolaboratifKerjaSama",
  "kolaboratifDiskusi",
  "kolaboratifKoordinasi"
];

const clampScore = (value: number) => {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const average = (...scores: number[]) =>
  Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2));

const calculateDimensions = (form: BerakhlakPayload): DimensionSummary => {
  const pelayananAvg = average(form.pelayananResponsif, form.pelayananRamah, form.pelayananSolutif);
  const akuntabelAvg = average(form.akuntabelProsedur, form.akuntabelTransparansi, form.akuntabelTanggungJawab);
  const kompetenAvg = average(form.kompetenPenguasaan, form.kompetenPenyelesaian, form.kompetenPengembangan);
  const harmonisAvg = average(form.harmonisTim, form.harmonisRelasi, form.harmonisLingkungan);
  const loyalAvg = average(form.loyalKomitmen, form.loyalAturan, form.loyalDedikasi);
  const adaptifAvg = average(form.adaptifPerubahan, form.adaptifFleksibilitas, form.adaptifBelajar);
  const kolaboratifAvg = average(form.kolaboratifKerjaSama, form.kolaboratifDiskusi, form.kolaboratifKoordinasi);

  return {
    pelayananAvg,
    akuntabelAvg,
    kompetenAvg,
    harmonisAvg,
    loyalAvg,
    adaptifAvg,
    kolaboratifAvg,
    finalScore: average(
      pelayananAvg,
      akuntabelAvg,
      kompetenAvg,
      harmonisAvg,
      loyalAvg,
      adaptifAvg,
      kolaboratifAvg
    )
  };
};

export const useBerakhlakForm = (initialForm: BerakhlakPayload) => {
  const [form, setForm] = useState<BerakhlakPayload>(initialForm);

  const dimensions = useMemo(() => calculateDimensions(form), [form]);

  const completion = useMemo(() => {
    const answeredCount = SCORE_FIELDS.filter((key) => Number(form[key]) > 0).length;
    return {
      answeredCount,
      totalCount: SCORE_FIELDS.length
    };
  }, [form]);

  const updateField = (key: FormFieldKey, value: string | number) => {
    setForm((previous) => ({
      ...previous,
      [key]:
        key === "note"
          ? String(value)
          : typeof previous[key] === "number"
            ? Number(value)
            : value
    }));
  };

  const updateScore = (key: FormFieldKey, value: number) => {
    setForm((previous) => ({
      ...previous,
      [key]: clampScore(value)
    }));
  };

  const applyEvaluation = (evaluation: BerakhlakEvaluation) => {
    setForm({
      employeeId: evaluation.employeeId,
      evaluatorEmployeeId: evaluation.evaluatorEmployeeId,
      evaluationYear: evaluation.evaluationYear,
      evaluationMonth: evaluation.evaluationMonth,
      pelayananResponsif: evaluation.pelayananResponsif,
      pelayananRamah: evaluation.pelayananRamah,
      pelayananSolutif: evaluation.pelayananSolutif,
      akuntabelProsedur: evaluation.akuntabelProsedur,
      akuntabelTransparansi: evaluation.akuntabelTransparansi,
      akuntabelTanggungJawab: evaluation.akuntabelTanggungJawab,
      kompetenPenguasaan: evaluation.kompetenPenguasaan,
      kompetenPenyelesaian: evaluation.kompetenPenyelesaian,
      kompetenPengembangan: evaluation.kompetenPengembangan,
      harmonisTim: evaluation.harmonisTim,
      harmonisRelasi: evaluation.harmonisRelasi,
      harmonisLingkungan: evaluation.harmonisLingkungan,
      loyalKomitmen: evaluation.loyalKomitmen,
      loyalAturan: evaluation.loyalAturan,
      loyalDedikasi: evaluation.loyalDedikasi,
      adaptifPerubahan: evaluation.adaptifPerubahan,
      adaptifFleksibilitas: evaluation.adaptifFleksibilitas,
      adaptifBelajar: evaluation.adaptifBelajar,
      kolaboratifKerjaSama: evaluation.kolaboratifKerjaSama,
      kolaboratifDiskusi: evaluation.kolaboratifDiskusi,
      kolaboratifKoordinasi: evaluation.kolaboratifKoordinasi,
      note: evaluation.note || ""
    });
  };

  const resetForm = (nextForm: BerakhlakPayload) => {
    setForm(nextForm);
  };

  return {
    form,
    setForm,
    dimensions,
    completion,
    updateField,
    updateScore,
    applyEvaluation,
    resetForm
  };
};
