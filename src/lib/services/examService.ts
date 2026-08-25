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

  private mockPracticeMaterials: Record<string, StudyMaterial[]> = {
    jee: [
      {
        id: "jee-prac-1",
        title: "Physics Mock Test - Core Mechanics",
        subject: "Physics",
        questionCount: 30,
      },
      {
        id: "jee-prac-2",
        title: "Chemistry Mock Test - Organic Reactions",
        subject: "Chemistry",
        questionCount: 25,
      },
    ],
  };

  getAllExams(): ExamInfo[] {
    return Object.values(this.exams);
  }

  getExamBySlug(slug: string): ExamInfo | null {
    return this.exams[slug.toLowerCase()] || null;
  }

  getMaterials(examSlug: string, tab: string = "materials"): StudyMaterial[] {
    const slug = examSlug.toLowerCase();
    
    if (tab === "practice") {
      return this.mockPracticeMaterials[slug] || [];
    }
    
    return this.mockMaterials[slug] || [];
  }
}

export const examService = new ExamService();
