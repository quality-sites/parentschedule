import moment from 'moment-timezone';

const terms = [
  { startDate: '2026-11-02T00:00:00.000Z', endDate: '2026-12-18T00:00:00.000Z', dadStarts: false }
];

const activeTerms = [...terms];

const lastTerm = activeTerms[activeTerms.length - 1];
const startOfContinuous = moment(lastTerm.endDate).add(1, 'day').toDate();
const endOfContinuous = moment(startOfContinuous).add(2, 'years').toDate();
activeTerms.push({
  startDate: startOfContinuous.toISOString(),
  endDate: endOfContinuous.toISOString(),
  dadStarts: false 
});

console.log(activeTerms);
