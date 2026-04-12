const fs = require('fs');
import { generateEventsFromConfig } from './lib/engine';
const config = JSON.parse(fs.readFileSync('/tmp/mockConfig.json', 'utf8'));
const events = generateEventsFromConfig(config);
console.log(events.filter(e => e.title.includes('Holiday') || e.title.includes('Week')));
