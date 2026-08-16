import type { ExamInfo, StudyMaterial } from "@/types/exam";

/**
 * Service for fetching exam configurations and available study materials
 */
class ExamService {
  private exams: Record<string, ExamInfo> = {
    jee: {
      slug: "jee",
      name: "JEE",
      fullName: "Joint Entrance Examination",
      description: "Joint Entrance Examination",
      subjects: ["Physics", "Chemistry", "Maths"],
    },
    neet: {
      slug: "neet",
      name: "NEET",
      fullName: "National Eligibility cum Entrance Test",
      description: "National Eligibility cum Entrance Test",
      subjects: ["Physics", "Chemistry", "Biology"],
    },
    keam: {
      slug: "keam",
      name: "KEAM",
      fullName: "Kerala Engineering Architecture Medical",
      description: "Kerala Engineering Architecture Medical",
      subjects: ["Physics", "Chemistry", "Maths", "Biology"],
    },
    cuet: {
      slug: "cuet",
      name: "CUET",
      fullName: "Common University Entrance Test",
      description: "Common University Entrance Test",
      subjects: ["Physics", "Chemistry", "Maths", "Biology"],
    },
  };

  private mockMaterials: Record<string, StudyMaterial[]> = {
    jee: [
      {
        id: "jee-mat-1",
        title: "Mechanics - Question Bank Vol 1",
        subject: "Physics",
        questionCount: 50,
      },
    ],
    neet: [
      {
        id: "neet-mat-1",
        title: "Mechanics - Question Bank Vol 1",
        subject: "Physics",
        questionCount: 50,
      },
    ],
    keam: [
      {
        id: "keam-mat-1",
        title: "Mechanics - Question Bank Vol 1",
        subject: "Physics",
        questionCount: 50,
      },
    ],
    cuet: [
      {
        id: "cuet-mat-1",
        title: "Mechanics - Question Bank Vol 1",
        subject: "Physics",
        questionCount: 50,
      },
    ],
  };

  getAllExams(): ExamInfo[] {
    return Object.values(this.exams);
  }

  getExamBySlug(slug: string): ExamInfo | null {
    return this.exams[slug.toLowerCase()] || null;
  }

  getMaterials(examSlug: string): StudyMaterial[] {
    return this.mockMaterials[examSlug.toLowerCase()] || [];
  }
}

export const examService = new ExamService();
