// lib/pte/pte-scoring.ts

// PTE Academic scoring structure
export type PTESkill = 
  | 'Speaking' 
  | 'Writing' 
  | 'Reading' 
  | 'Listening'
  | 'Enabling Skills';

export type PTEModule = 
  | 'RA' // Read Aloud
  | 'RS' // Repeat Sentence
  | 'DI' // Describe Image
  | 'RL' // Retell Lecture
  | 'ASQ' // Answer Short Question
  | 'SWT' // Summarize Written Text
  | 'WE' // Write Essay
  | 'FIB_RW' // Fill in the blanks (Reading & Writing)
  | 'MCS' // Multiple Choice, Single Answer
  | 'MCM' // Multiple Choice, Multiple Answers
  | 'RO' // Re-order Paragraphs
  | 'FIB_R' // Fill in the blanks (Reading)
  | 'SST' // Summarize Spoken Text
  | 'MCS_L' // Multiple Choice, Single Answer (Listening)
  | 'FIB_L' // Fill in the blanks (Listening)
  | 'HCS' // Highlight Correct Summary
  | 'MCM_L' // Multiple Choice, Multiple Answers (Listening)
  | 'SMW' // Select Missing Word
  | 'HIW' // Highlight Incorrect Words
  | 'WFD' // Write from Dictation
  | 'RTS' // Respond to a Situation
  | 'SGD' // Summarize Group Discussion;

export interface PTEModuleScore {
  module: PTEModule;
  name: string;
  description: string;
  contributingSkills: PTESkill[];
  scoreRange: [number, number]; // min, max score
  timeLimit: number; // in seconds
}

export interface PTEScoreBreakdown {
  overall: number;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
  enablingSkills?: {
    grammar: number;
    oralFluency: number;
    pronunciation: number;
    spelling: number;
    vocabulary: number;
    writtenDiscourse: number;
  };
}

// Define all PTE modules with their characteristics
export const pteModules: PTEModuleScore[] = [
  {
    module: 'RA',
    name: 'Read Aloud',
    description: 'Read a text aloud',
    contributingSkills: ['Speaking', 'Enabling Skills'],
    scoreRange: [10, 90],
    timeLimit: 60
  },
  {
    module: 'RS',
    name: 'Repeat Sentence',
    description: 'Repeat a sentence exactly as you hear it',
    contributingSkills: ['Speaking', 'Listening'],
    scoreRange: [10, 90],
    timeLimit: 15
  },
  {
    module: 'DI',
    name: 'Describe Image',
    description: 'Describe an image in detail',
    contributingSkills: ['Speaking'],
    scoreRange: [10, 90],
    timeLimit: 65
  },
  {
    module: 'RL',
    name: 'Retell Lecture',
    description: 'Summarize a lecture in your own words',
    contributingSkills: ['Speaking', 'Listening'],
    scoreRange: [10, 90],
    timeLimit: 40
  },
  {
    module: 'ASQ',
    name: 'Answer Short Question',
    description: 'Answer a question in a few words',
    contributingSkills: ['Speaking', 'Listening'],
    scoreRange: [10, 90],
    timeLimit: 10
  },
  {
    module: 'SWT',
    name: 'Summarize Written Text',
    description: 'Write a one-sentence summary of a text',
    contributingSkills: ['Writing', 'Reading', 'Enabling Skills'],
    scoreRange: [10, 90],
    timeLimit: 600
  },
  {
    module: 'WE',
    name: 'Write Essay',
    description: 'Write an essay on a given topic',
    contributingSkills: ['Writing', 'Enabling Skills'],
    scoreRange: [10, 90],
    timeLimit: 1200
  },
  {
    module: 'FIB_RW',
    name: 'Reading & Writing: Fill in the Blanks',
    description: 'Fill in blanks in a text',
    contributingSkills: ['Reading', 'Writing', 'Enabling Skills'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'MCS',
    name: 'Multiple Choice, Single Answer',
    description: 'Choose one correct answer',
    contributingSkills: ['Reading'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'MCM',
    name: 'Multiple Choice, Multiple Answers',
    description: 'Choose multiple correct answers',
    contributingSkills: ['Reading', 'Listening'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'RO',
    name: 'Re-order Paragraphs',
    description: 'Reorder paragraphs to form a coherent text',
    contributingSkills: ['Reading'],
    scoreRange: [10, 90],
    timeLimit: 180
  },
  {
    module: 'FIB_R',
    name: 'Reading: Fill in the Blanks',
    description: 'Fill in blanks in a text',
    contributingSkills: ['Reading', 'Enabling Skills'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'SST',
    name: 'Summarize Spoken Text',
    description: 'Write a summary of a spoken text',
    contributingSkills: ['Listening', 'Writing', 'Enabling Skills'],
    scoreRange: [10, 90],
    timeLimit: 600
  },
  {
    module: 'MCS_L',
    name: 'Multiple Choice, Single Answer (Listening)',
    description: 'Choose one correct answer from audio',
    contributingSkills: ['Listening'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'FIB_L',
    name: 'Fill in the Blanks (Listening)',
    description: 'Fill in blanks from audio',
    contributingSkills: ['Listening', 'Enabling Skills'],
    scoreRange: [10, 90],
    timeLimit: 150
  },
  {
    module: 'HCS',
    name: 'Highlight Correct Summary',
    description: 'Choose the correct summary from audio',
    contributingSkills: ['Listening'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'MCM_L',
    name: 'Multiple Choice, Multiple Answers (Listening)',
    description: 'Choose multiple correct answers from audio',
    contributingSkills: ['Listening'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'SMW',
    name: 'Select Missing Word',
    description: 'Select the missing word from audio',
    contributingSkills: ['Listening'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'HIW',
    name: 'Highlight Incorrect Words',
    description: 'Highlight incorrect words from audio',
    contributingSkills: ['Listening'],
    scoreRange: [10, 90],
    timeLimit: 90
  },
  {
    module: 'WFD',
    name: 'Write from Dictation',
    description: 'Write a sentence as you hear it',
    contributingSkills: ['Listening', 'Writing', 'Enabling Skills'],
    scoreRange: [10, 90],
    timeLimit: 90
  }
];

// Calculate scores based on PTE Academic algorithm
export const calculatePTEScore = (responses: any[]): PTEScoreBreakdown => {
  // This would implement the actual PTE scoring algorithm
  // For demonstration, returning mock scores
  return {
    overall: 78,
    speaking: 75,
    writing: 82,
    reading: 85,
    listening: 80,
    enablingSkills: {
      grammar: 78,
      oralFluency: 72,
      pronunciation: 76,
      spelling: 85,
      vocabulary: 80,
      writtenDiscourse: 79
    }
  };
};

// Get module by code
export const getModuleByCode = (code: string): PTEModuleScore | undefined => {
  return pteModules.find(module => 
    module.module === code || 
    module.name.toLowerCase().replace(/\s+/g, '') === code.toLowerCase().replace(/\s+/g, '')
  );
};