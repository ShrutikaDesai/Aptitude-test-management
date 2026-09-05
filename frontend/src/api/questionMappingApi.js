import axiosInstance from "../axiosInstance";

// GET /asse/assessment-builder/versions/{versionId}/grades/
// Returns the grades mapped to a specific assessment version — used to
// populate the Grade filter dropdown in the Question Mapping step's
// Assign Questions modal.
export const getAssessmentVersionGrades = (versionId) =>
  axiosInstance.get(`/asse/assessment-builder/versions/${versionId}/grades/`);


// GET /asse/assessment-questions/grades/{gradeId}/tags/{tagId}/
// Fetch questions based on selected Grade and Tag
export const getQuestionsByGradeAndTag = (gradeIds, tagIds) => {
  const gradeSegment = Array.isArray(gradeIds) ? gradeIds.join(",") : gradeIds;
  const tagSegment = Array.isArray(tagIds) ? tagIds.join(",") : tagIds;

  return axiosInstance.get(
    `/asse/assessment-questions/grades/${gradeSegment}/tags/${tagSegment}/`
  );
};