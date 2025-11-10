// Mock data for PTE practice questions

type Question = {
  id: string;
  title: string;
  difficulty: string;
  duration: string;
};

type QuestionType = {
  [key: string]: Question[];
};

export type MockQuestions = {
  speaking: QuestionType;
  writing: QuestionType;
  reading: QuestionType;
  listening: QuestionType;
};

export const mockQuestions: MockQuestions = {
  speaking: {
    "Read Aloud": [
      {
        id: "ra-1",
        title: "Read Aloud Sample 1",
        difficulty: "Easy",
        duration: "30s",
      },
      {
        id: "ra-2",
        title: "Read Aloud Sample 2",
        difficulty: "Medium",
        duration: "45s",
      },
      {
        id: "ra-3",
        title: "Read Aloud Sample 3",
        difficulty: "Hard",
        duration: "60s",
      },
    ],
    "Repeat Sentence": [
      {
        id: "rs-1",
        title: "Repeat Sentence Sample 1",
        difficulty: "Easy",
        duration: "15s",
      },
      {
        id: "rs-2",
        title: "Repeat Sentence Sample 2",
        difficulty: "Medium",
        duration: "20s",
      },
    ],
    "Describe Image": [
      {
        id: "di-1",
        title: "Describe Image Sample 1",
        difficulty: "Medium",
        duration: "40s",
      },
    ],
    "Retell Lecture": [
      {
        id: "rl-1",
        title: "Retell Lecture Sample 1",
        difficulty: "Hard",
        duration: "40s",
      },
    ],
    "Answer Short Question": [
      {
        id: "asq-1",
        title: "Answer Short Question Sample 1",
        difficulty: "Easy",
        duration: "10s",
      },
    ],
    "Respond to a Situation": [
      {
        id: "rts-1",
        title: "Respond to a Situation Sample 1",
        difficulty: "Medium",
        duration: "45s",
      },
    ],
    "Summarize Group Discussion": [
      {
        id: "sgd-1",
        title: "Summarize Group Discussion Sample 1",
        difficulty: "Hard",
        duration: "50s",
      },
    ],
  },
  writing: {
    "Summarize Written Text": [
      {
        id: "swt-1",
        title: "Summarize Written Text Sample 1",
        difficulty: "Medium",
        duration: "10m",
      },
    ],
    "Write Essay": [
      {
        id: "we-1",
        title: "Write Essay Sample 1",
        difficulty: "Hard",
        duration: "20m",
      },
    ],
  },
  reading: {
    "Re-order Paragraphs": [
      {
        id: "rop-1",
        title: "Re-order Paragraphs Sample 1",
        difficulty: "Medium",
        duration: "5m",
      },
    ],
    "Reading: Fill in the Blanks": [
      {
        id: "rfib-1",
        title: "Reading Fill in the Blanks Sample 1",
        difficulty: "Hard",
        duration: "5m",
      },
    ],
    "Multiple Choice, Choose Single Answer": [
      {
        id: "mcsa-1",
        title: "Multiple Choice Single Answer Sample 1",
        difficulty: "Easy",
        duration: "3m",
      },
    ],
    "Multiple Choice, Choose Multiple Answers": [
      {
        id: "mcma-1",
        title: "Multiple Choice Multiple Answers Sample 1",
        difficulty: "Medium",
        duration: "4m",
      },
    ],
    "Reading & Writing: Fill in the Blanks": [
      {
        id: "rwwfib-1",
        title: "Reading & Writing Fill in the Blanks Sample 1",
        difficulty: "Hard",
        duration: "6m",
      },
    ],
  },
  listening: {
    "Summarize Spoken Text": [
      {
        id: "sst-1",
        title: "Summarize Spoken Text Sample 1",
        difficulty: "Hard",
        duration: "10m",
      },
    ],
    "Multiple Choice, Choose Single Answer": [
      {
        id: "lmcsa-1",
        title: "Listening Multiple Choice Single Answer Sample 1",
        difficulty: "Medium",
        duration: "4m",
      },
    ],
    "Fill in the Blanks": [
      {
        id: "lfitb-1",
        title: "Listening Fill in the Blanks Sample 1",
        difficulty: "Hard",
        duration: "5m",
      },
    ],
    "Highlight Correct Summary": [
      {
        id: "hcs-1",
        title: "Highlight Correct Summary Sample 1",
        difficulty: "Medium",
        duration: "3m",
      },
    ],
    "Multiple Choice, Choose Multiple Answers": [
      {
        id: "lmcma-1",
        title: "Listening Multiple Choice Multiple Answers Sample 1",
        difficulty: "Hard",
        duration: "5m",
      },
    ],
    "Select Missing Word": [
      {
        id: "smw-1",
        title: "Select Missing Word Sample 1",
        difficulty: "Easy",
        duration: "2m",
      },
    ],
    "Highlight Incorrect Words": [
      {
        id: "hiw-1",
        title: "Highlight Incorrect Words Sample 1",
        difficulty: "Medium",
        duration: "4m",
      },
    ],
    "Write from Dictation": [
      {
        id: "wfd-1",
        title: "Write from Dictation Sample 1",
        difficulty: "Easy",
        duration: "3m",
      },
    ],
  },
};