// Global state object shared across files.
// Think of this as a "GameState" struct in C++.
const state = {
    user: null,       // logged-in user object
    quiz: null,       // full quiz data (title, sections, etc.)
    answers: {},      // dictionary of answers { "matching-1": "A", "tf-2": true }
    startTime: null,  // Date object when quiz started
    endTime: null,    // Date object when quiz ended
    settings: null    // loaded from settings.json
  };
  