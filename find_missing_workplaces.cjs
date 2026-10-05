const fs = require('fs');

// We'll read the raw TS file to extract names since we can't easily require TS
const mockEmp = fs.readFileSync('./src/data/mockEmployees.ts', 'utf-8');
const hseQuestions = fs.readFileSync('./src/data/hseQuestions.ts', 'utf-8');

// Extract workplace names from mockEmployees.ts
const empWorkplaces = new Set();
const matches = mockEmp.matchAll(/workplace:\s*"([^"]+)"/g);
for (const match of matches) {
  empWorkplaces.add(match[1]);
}

// Extract workplace names from hseQuestions.ts
const initialWorkplaces = new Set();
const hseMatches = hseQuestions.matchAll(/name:\s*"([^"]+)"/g);
for (const match of hseMatches) {
  initialWorkplaces.add(match[1]);
}

const missing = [...empWorkplaces].filter(wp => !initialWorkplaces.has(wp));
console.log("Missing workplaces in INITIAL_WORKPLACES:");
console.log(missing);

// We will also check job positions just in case
const empJobs = new Set();
const jobMatches = mockEmp.matchAll(/jobPosition:\s*"([^"]+)"/g);
for (const match of jobMatches) {
  empJobs.add(match[1]);
}

const initialJobs = new Set();
// they might be named inside INITIAL_JOB_POSITIONS block
const lines = hseQuestions.split('\n');
let inJobs = false;
for (const line of lines) {
  if (line.includes('INITIAL_JOB_POSITIONS')) inJobs = true;
  if (inJobs && line.includes('name:')) {
    const match = line.match(/name:\s*"([^"]+)"/);
    if (match) initialJobs.add(match[1]);
  }
}

const missingJobs = [...empJobs].filter(jp => !initialJobs.has(jp));
console.log("Missing job positions in INITIAL_JOB_POSITIONS:");
console.log(missingJobs);

// Generate new lines to add to INITIAL_WORKPLACES
let nextId = 350;
const newWorkplaceLines = missing.map(wp => {
  const id = wp.toLowerCase().replace(/\s+/g, '-');
  return `  { id: "${id}", name: "${wp}", code: 'P${nextId++}' },`;
});
console.log("\nAdd this to INITIAL_WORKPLACES:");
console.log(newWorkplaceLines.join('\n'));

// Generate new lines for Job Positions
const newJobLines = missingJobs.map(jp => {
  const id = jp.toLowerCase().replace(/\s+/g, '_');
  return `  { id: "${id}", name: "${jp}", category: "Outros" },`;
});
console.log("\nAdd this to INITIAL_JOB_POSITIONS:");
console.log(newJobLines.join('\n'));
