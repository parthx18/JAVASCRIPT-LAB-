// routine.js - class routine data (named exports)
// duration is in seconds (short values so the demo is quick to run)
export const routine = [
  { subject: "Web Technologies", venue: "Lab 3",    duration: 15 },
  { subject: "Database Systems", venue: "Room 204", duration: 20 },
  { subject: "Computer Networks", venue: "Lab 1",   duration: 25 },
];

export function nextIndex(i) {
  return (i + 1) % routine.length;
}
