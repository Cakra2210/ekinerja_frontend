import { api } from "@/shared/api/client";
import {
  ApiResponse,
  CompetencyDevelopmentActivity,
  CompetencyDevelopmentMeta,
  CompetencyDevelopmentPayload,
  CompetencyDevelopmentRecap
} from "@/shared/types";

export type CompetencyDevelopmentQuery = {
  year?: number;
  quarter?: number;
  employeeId?: number;
};

export const fetchCompetencyDevelopmentRecap = async (
  query: CompetencyDevelopmentQuery = {}
) => {
  const response = await api.get<
    ApiResponse<{
      recap: CompetencyDevelopmentRecap[];
      activities: CompetencyDevelopmentActivity[];
    }> & {
      meta?: CompetencyDevelopmentMeta;
    }
  >("/competency-development", {
    params: query
  });

  return {
    recap: response.data.data.recap,
    activities: response.data.data.activities,
    meta: response.data.meta
  };
};

const buildCompetencyFormData = (payload: CompetencyDevelopmentPayload) => {
  const formData = new FormData();

  formData.append("employeeId", String(payload.employeeId));
  formData.append("activityName", payload.activityName);
  formData.append("activityType", payload.activityType);
  formData.append("startDate", payload.startDate);
  formData.append("endDate", payload.endDate);
  formData.append("activityRole", payload.activityRole);
  formData.append("learningHours", String(payload.learningHours));
  formData.append("note", payload.note || "");

  if (payload.invitationFile) {
    formData.append("invitationFile", payload.invitationFile);
  }

  if (payload.certificateFile) {
    formData.append("certificateFile", payload.certificateFile);
  }

  return formData;
};

export const saveCompetencyDevelopmentActivity = async (
  payload: CompetencyDevelopmentPayload
) => {
  const response = await api.post<ApiResponse<CompetencyDevelopmentActivity>>(
    "/competency-development",
    buildCompetencyFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
};

export const deleteCompetencyDevelopmentActivity = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(
    `/competency-development/${id}`
  );

  return response.data;
};
