const SupportCode = require('../common/support-code.cjs');

module.exports = {
	'0101': new SupportCode('Missing name', 'Missing description', 'The connection was lost.', 'Missing fix', 'Missing link'),
	'0102': new SupportCode('Missing name', 'Missing description', 'Cannot find connection partner.', 'Missing fix', 'Missing link'),
	'1999': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'9999': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
};