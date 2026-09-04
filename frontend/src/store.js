import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import assessmentReducer from "./slices/assessmentSlice";
import gradeReducer from "./slices/gradeSlice";
import sectionReducer from "./slices/sectionSlice";
import subsectionReducer from "./slices/subsectionSlice";
import questionReducer from "./slices/questionSlice";
import tagReducer from "./slices/tagSlice";
import reportReducer from "./slices/reportSlice";

// student imports
import studentSectionReducer from "./slices/student-slices/studentSectionSlice";
import studentSubsectionReducer from "./slices/student-slices/studentSubsectionSlice";
import studentQuestionReducer from "./slices/student-slices/studentQuestionSlice";


export const store = configureStore({
  reducer: {
    // admin reducers
    auth: authReducer,
    assessment: assessmentReducer,
    grade: gradeReducer,
    section: sectionReducer,
    subsection: subsectionReducer,
    question: questionReducer,
    tag: tagReducer,
    report: reportReducer,
    

    // student reducers
    studentSection: studentSectionReducer,
    studentSubsection: studentSubsectionReducer,
    studentQuestion: studentQuestionReducer,


  },
});