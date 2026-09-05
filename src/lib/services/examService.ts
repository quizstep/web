import type { ExamInfo, StudyMaterial, ChapterTopic, TopicNote, TopicShortNote, TopicDoubt } from "@/types/exam";

/**
 * Service for fetching exam configurations, chapter topics, and study content
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

  // Chapter topics per subject (extracted from resource images)
  private subjectTopics: Record<string, ChapterTopic[]> = {
    Biology: [
      // BOTANY - Class 11
      { id: "bio-bot-1", name: "Biological Classification", category: "Class XI Botany" },
      { id: "bio-bot-2", name: "Plant Kingdom", category: "Class XI Botany" },
      { id: "bio-bot-3", name: "Morphology of flowering plants", category: "Class XI Botany" },
      { id: "bio-bot-4", name: "Anatomy of flowering plants", category: "Class XI Botany" },
      { id: "bio-bot-5", name: "Cell the unit of life", category: "Class XI Botany" },
      { id: "bio-bot-6", name: "Cell cycle and Cell division", category: "Class XI Botany" },
      { id: "bio-bot-7", name: "Photosynthesis in higher plants", category: "Class XI Botany" },
      { id: "bio-bot-8", name: "Respiration in Plants", category: "Class XI Botany" },
      { id: "bio-bot-9", name: "Plant Growth and Development", category: "Class XI Botany" },
      
      // ZOOLOGY - Class 11
      { id: "bio-zoo-1", name: "The Living World", category: "Class XI Zoology" },
      { id: "bio-zoo-2", name: "Animal Kingdom - Non Chordata", category: "Class XI Zoology" },
      { id: "bio-zoo-3", name: "Animal Kingdom - Phylum Chordata", category: "Class XI Zoology" },
      { id: "bio-zoo-4", name: "Structural organisation in Animals (Animal Tissue, Morphology of Animals)", category: "Class XI Zoology" },
      { id: "bio-zoo-5", name: "Biomolecules", category: "Class XI Zoology" },
      { id: "bio-zoo-6", name: "Breathing and Exchange of Gases", category: "Class XI Zoology" },
      { id: "bio-zoo-7", name: "Body Fluids and Circulation", category: "Class XI Zoology" },
      { id: "bio-zoo-8", name: "Excretory Products and Their Elimination", category: "Class XI Zoology" },
      { id: "bio-zoo-9", name: "Locomotion and Movement", category: "Class XI Zoology" },
      { id: "bio-zoo-10", name: "Neural Control and Co-ordination", category: "Class XI Zoology" },
      { id: "bio-zoo-11", name: "Chemical Co-ordination and Integration", category: "Class XI Zoology" },
      
      // BOTANY - Class 12
      { id: "bio-bot-12-1", name: "Sexual reproduction in flowering plants", category: "Class XII Botany" },
      { id: "bio-bot-12-2", name: "Biotechnology - Principles and Processes", category: "Class XII Botany" },
      { id: "bio-bot-12-3", name: "Biotechnology and Its Applications", category: "Class XII Botany" },
      { id: "bio-bot-12-4", name: "Organism and Population", category: "Class XII Botany" },
      { id: "bio-bot-12-5", name: "Ecosystem", category: "Class XII Botany" },

      // ZOOLOGY - Class 12
      { id: "bio-zoo-12-1", name: "Human Reproduction and Reproductive Health", category: "Class XII Zoology" },
      { id: "bio-zoo-12-2", name: "Principles of Inheritance and Variation", category: "Class XII Zoology" },
      { id: "bio-zoo-12-3", name: "Molecular Basis of Inheritance", category: "Class XII Zoology" },
      { id: "bio-zoo-12-4", name: "Evolution", category: "Class XII Zoology" },
      { id: "bio-zoo-12-5", name: "Human Health and Disease", category: "Class XII Zoology" },
      { id: "bio-zoo-12-6", name: "Microbes in Human Welfare", category: "Class XII Zoology" },
      { id: "bio-zoo-12-7", name: "Biodiversity and Conservation", category: "Class XII Zoology" },
    ],
    Chemistry: [
      // Class 11 Chemistry
      { id: "chem-11-1", name: "Some Basic Concepts of Chemistry", category: "Class XI Chemistry" },
      { id: "chem-11-2", name: "Structure of Atom", category: "Class XI Chemistry" },
      { id: "chem-11-3", name: "Classification of Elements and Periodicity in Properties", category: "Class XI Chemistry" },
      { id: "chem-11-4", name: "Chemical Bonding and Molecular Structure", category: "Class XI Chemistry" },
      { id: "chem-11-5", name: "States of Matter (or Chemical Thermodynamics)", category: "Class XI Chemistry" },
      { id: "chem-11-6", name: "Chemical Thermodynamics (or Equilibrium)", category: "Class XI Chemistry" },
      { id: "chem-11-7", name: "Equilibrium", category: "Class XI Chemistry" },
      { id: "chem-11-8", name: "Redox Reactions", category: "Class XI Chemistry" },
      { id: "chem-11-9", name: "Hydrogen", category: "Class XI Chemistry" },
      { id: "chem-11-10", name: "The s-Block Elements", category: "Class XI Chemistry" },
      { id: "chem-11-11", name: "Some p-Block Elements", category: "Class XI Chemistry" },
      { id: "chem-11-12", name: "Organic Chemistry – Some Basic Principles and Techniques", category: "Class XI Chemistry" },
      { id: "chem-11-13", name: "Hydrocarbons", category: "Class XI Chemistry" },
      { id: "chem-11-14", name: "Environmental Chemistry", category: "Class XI Chemistry" },
      
      // Class 12 Chemistry
      { id: "chem-12-1", name: "The Solid State", category: "Class XII Chemistry" },
      { id: "chem-12-2", name: "Solutions", category: "Class XII Chemistry" },
      { id: "chem-12-3", name: "Electrochemistry", category: "Class XII Chemistry" },
      { id: "chem-12-4", name: "Chemical Kinetics", category: "Class XII Chemistry" },
      { id: "chem-12-5", name: "Surface Chemistry", category: "Class XII Chemistry" },
      { id: "chem-12-6", name: "General Principles and Processes of Isolation of Elements", category: "Class XII Chemistry" },
      { id: "chem-12-7", name: "The p-Block Elements", category: "Class XII Chemistry" },
      { id: "chem-12-8", name: "The d- and f-Block Elements", category: "Class XII Chemistry" },
      { id: "chem-12-9", name: "Coordination Compounds", category: "Class XII Chemistry" },
      { id: "chem-12-10", name: "Haloalkanes and Haloarenes", category: "Class XII Chemistry" },
      { id: "chem-12-11", name: "Alcohols, Phenols and Ethers", category: "Class XII Chemistry" },
      { id: "chem-12-12", name: "Aldehydes, Ketones and Carboxylic Acids", category: "Class XII Chemistry" },
      { id: "chem-12-13", name: "Amines", category: "Class XII Chemistry" },
      { id: "chem-12-14", name: "Biomolecules", category: "Class XII Chemistry" },
      { id: "chem-12-15", name: "Polymers", category: "Class XII Chemistry" },
      { id: "chem-12-16", name: "Chemistry in Everyday Life", category: "Class XII Chemistry" },
    ],
    Physics: [
      { id: "phy-1", name: "Units, Dimensions and Measurements", category: "Class XI Physics" },
      { id: "phy-2", name: "Kinematics & Laws of Motion", category: "Class XI Physics" },
      { id: "phy-3", name: "Work, Power and Energy", category: "Class XI Physics" },
      { id: "phy-4", name: "Rotational Motion", category: "Class XI Physics" },
      { id: "phy-5", name: "Gravitation", category: "Class XI Physics" },
      { id: "phy-6", name: "Human Physiology & Thermodynamics", category: "Class XI Physics" },
      { id: "phy-7", name: "Electrostatics & Capacitance", category: "Class XII Physics" },
      { id: "phy-8", name: "Current Electricity & Circuits", category: "Class XII Physics" },
      { id: "phy-9", name: "Magnetic Effects of Current", category: "Class XII Physics" },
      { id: "phy-10", name: "Optics and Wave Phenomena", category: "Class XII Physics" },
    ],
    Maths: [
      { id: "math-1", name: "Sets, Relations and Functions", category: "Class XI Maths" },
      { id: "math-2", name: "Complex Numbers & Quadratic Equations", category: "Class XI Maths" },
      { id: "math-3", name: "Matrices and Determinants", category: "Class XII Maths" },
      { id: "math-4", name: "Limits, Continuity and Differentiability", category: "Class XII Maths" },
      { id: "math-5", name: "Integrals & Differential Equations", category: "Class XII Maths" },
      { id: "math-6", name: "Vector Algebra & 3D Geometry", category: "Class XII Maths" },
    ],
  };

  private mockMaterials: Record<string, StudyMaterial[]> = {
    jee: [
      {
        id: "jee-mat-1",
        title: "Mechanics & Kinematics - Complete Question Bank",
        subject: "Physics",
        questionCount: 50,
      },
      {
        id: "jee-mat-2",
        title: "Organic Chemistry - Basic Principles Question Bank",
        subject: "Chemistry",
        questionCount: 45,
      },
    ],
    neet: [
      {
        id: "neet-mat-1",
        title: "Human Physiology - Complete Notes & Practice Bank",
        subject: "Biology",
        questionCount: 60,
      },
      {
        id: "neet-mat-2",
        title: "Chemical Bonding - Comprehensive Question Bank",
        subject: "Chemistry",
        questionCount: 40,
      },
    ],
    keam: [
      {
        id: "keam-mat-1",
        title: "KEAM Physics & Mathematics Formula & Question Sheet",
        subject: "Physics",
        questionCount: 50,
      },
    ],
    cuet: [
      {
        id: "cuet-mat-1",
        title: "CUET General Science & Domain Subject Question Bank",
        subject: "Biology",
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
    const slug = examSlug.toLowerCase();
    return this.mockMaterials[slug] || [];
  }

  getTopicsBySubject(subjectName: string): ChapterTopic[] {
    const normalized = Object.keys(this.subjectTopics).find(
      (s) => s.toLowerCase() === subjectName.toLowerCase()
    );
    return normalized ? this.subjectTopics[normalized] : [];
  }

  getTopicNotes(topicName: string): TopicNote {
    return {
      title: `${topicName} - Detailed Notes`,
      content: `Detailed study notes and conceptual breakdown for ${topicName}. Covering core definitions, physiological mechanisms, governing laws, and illustrative standard problems to ensure comprehensive mastery for competitive examinations.`,
      downloadUrl: "#download-pdf",
      keyPoints: [
        "Core conceptual foundations and definitions",
        "Step-by-step mechanism and theoretical principles",
        "Key standard formulas and standard values to remember",
        "Important exam trends and frequently asked question patterns"
      ]
    };
  }

  getTopicShortNotes(topicName: string): TopicShortNote {
    return {
      title: `${topicName} - Quick Revision Notes`,
      summary: `Concise revision summary designed for quick last-minute review of key concepts in ${topicName}.`,
      keyPoints: [
        `Primary definition & key equations for ${topicName}`,
        "Crucial exceptions and high-yield exam takeaways",
        "Formula shortcut sheet & rapid calculation tips"
      ],
      formulaeOrKeywords: [
        "Key Term 1: Fundamental Law",
        "Key Term 2: Standard Equilibrium Equation",
        "Key Term 3: Primary Regulation Mechanism"
      ]
    };
  }

  getTopicDoubts(topicName: string): TopicDoubt[] {
    return [
      {
        id: "d-1",
        question: `What are the most common exam questions asked from ${topicName}?`,
        answer: `In competitive exams, questions on ${topicName} frequently test primary principles, numerical applications, and conceptual exceptions. Make sure to review previous year questions focusing on standard mechanisms.`,
        createdAt: "2 days ago",
        status: "answered"
      },
      {
        id: "d-2",
        question: `How should I approach memory-based facts in ${topicName}?`,
        answer: `Use active recall and quick revision tables provided in the Short Notes section to lock in key terms effectively.`,
        createdAt: "1 week ago",
        status: "answered"
      }
    ];
  }
}

export const examService = new ExamService();

