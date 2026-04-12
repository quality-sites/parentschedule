const moment = require('moment-timezone');

const currentTerm = { endDate: "2026-10-23T00:00:00.000Z", dadStarts: true, holidayStrategy: "split_specific", customSplit: { isoWeekday: 3, hour: 13, minute: 0 } };
const nextTerm = { startDate: "2026-11-01T00:00:00.000Z" };

const holidayStart = moment(new Date(currentTerm.endDate)).tz('Europe/London').hour(15).minute(10).second(0);
const holidayEnd = moment(new Date(nextTerm.startDate)).tz('Europe/London').hour(8).minute(40).second(0);

const totalDays = holidayEnd.diff(holidayStart, 'days');
let applyStrategy = currentTerm.holidayStrategy || 'auto';
let splitConfig = currentTerm.customSplit || null;

console.log(`Holiday gap: ${holidayStart.format()} TO ${holidayEnd.format()}, Total days: ${totalDays}`);
console.log(`Apply: ${applyStrategy}`);

let parentIndex = 1; // Father

if (applyStrategy === 'split_specific' && splitConfig) {
    const { isoWeekday = 3, hour = 13, minute = 0 } = splitConfig;
    let handoverAnchor = holidayStart.clone().isoWeekday(isoWeekday).hour(hour).minute(minute).second(0);
    console.log(`Initial Handover: ${handoverAnchor.format()}`);
    if (handoverAnchor.isBefore(holidayStart)) {
        handoverAnchor.add(1, 'week');
        console.log(`Added 1 week, Handover: ${handoverAnchor.format()}`);
    }

    if (handoverAnchor.isAfter(holidayEnd)) {
        console.log(`Parent gets full: ${holidayStart.format()} to ${holidayEnd.format()}`);
    } else {
        console.log(`Half 1: ${holidayStart.format()} to ${handoverAnchor.format()}`);
        const secondStart = handoverAnchor.clone().add(1, 'second');
        if (secondStart.isSameOrBefore(holidayEnd)) {
            console.log(`Half 2: ${secondStart.format()} to ${holidayEnd.format()}`);
        }
    }
} else if (applyStrategy === 'auto') {
    if (totalDays <= 11 && totalDays > 0) applyStrategy = 'split_half';
    else applyStrategy = 'weekly_alt';
    console.log(`Fallback strategy: ${applyStrategy}`);
    
    if (applyStrategy === 'weekly_alt') {
        const isoWeekday = 5; 
        const hour = 18;
        const minute = 0;
        let blockStart = holidayStart.clone();
      
        while (blockStart.isBefore(holidayEnd)) {
          let blockEnd = blockStart.clone().isoWeekday(isoWeekday).hour(hour).minute(minute).second(0);
          if (blockEnd.isSameOrBefore(blockStart)) {
            blockEnd.add(1, 'week');
          }
          blockEnd = moment.min(blockEnd, holidayEnd);

          console.log(`Week Block: ${blockStart.format()} to ${blockEnd.format()}`);
          blockStart = blockEnd.clone().add(1, 'second');
        }
    } else if (applyStrategy === 'split_half') {
      const half = Math.floor(totalDays / 2);
      let end = moment.min(holidayStart.clone().add(half, 'days').endOf('day'), holidayEnd);
      console.log(`Half 1: ${holidayStart.format()} to ${end.format()}`);
      console.log(`Half 2: ${end.clone().add(1, 'second').format()} to ${holidayEnd.format()}`);
    }
}
