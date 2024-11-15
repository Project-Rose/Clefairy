const SupportCode = require('../common/support-code.cjs');

module.exports = {
	'0300': new SupportCode('Missing name', 'Missing description', 'An error occurred while trying to write\nor read amiibo data. Please try again.', 'Missing fix', 'Missing link'),
	'0305': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'0400': new SupportCode('Missing name', 'Missing description', 'The device you used is\nnot an amiibo figure.', 'Missing fix', 'Missing link'),
	'0401': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'0405': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'0409': new SupportCode('Missing name', 'Missing description', 'This is an invalid amiibo.\n\nIf the problem persists, please\nvisit support.nintendo.com.', 'Missing fix', 'Missing link'),
	'0413': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'0500': new SupportCode('Missing name', 'Missing description', 'The amiibo data is corrupted.\n\nWould you like to restore it with\ndata saved on this console?', 'Missing fix', 'Missing link'),
	'0510': new SupportCode('Missing name', 'Missing description', 'The amiibo data is corrupted.\n\nIf you have used this amiibo on a\nNintendo device before, then you can\nuse that device to restore the data.\nIf not, please reset the amiibo via\nSystem Settings ⇒ amiibo Settings.', 'Missing fix', 'Missing link'),
	'0530': new SupportCode('Missing name', 'Missing description', 'Please register an owner and\nnickname for the amiibo.', 'Missing fix', 'Missing link'),
	'0550': new SupportCode('Missing name', 'Missing description', 'This amiibo already has data from\nanother software title written to it.\n\nDo you want to delete that data so\nthat this software can write to it?', 'Missing fix', 'Missing link'),
	'0570': new SupportCode('Missing name', 'Missing description', 'This is not the same amiibo.', 'Missing fix', 'Missing link'),
	'0590': new SupportCode('Missing name', 'Missing description', 'This amiibo is not supported.', 'Missing fix', 'Missing link'),
	'1800': new SupportCode('Missing name', 'Missing description', 'The system memory is corrupted.\n\nPlease turn off the Wii U console\nand try again.\n\nIf the problem persists, please\nmake a note of the error code and\nvisit support.nintendo.com.', 'Missing fix', 'Missing link'),
	'1801': new SupportCode('Missing name', 'Missing description', 'You need at least 9 MB of free space\nin the system memory to use amiibo.\n\nPlease go to Data Management in\nSystem Settings and free up some\nspace.', 'Missing fix', 'Missing link'),
	'1805': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'1809': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'1813': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'1999': new SupportCode('Missing name', 'Missing description', 'An error occurred while trying to write\nor read amiibo data. Please try again.', 'Missing fix', 'Missing link'),
	'2000': new SupportCode('Missing name', 'Missing description', 'Missing message', 'Missing fix', 'Missing link'),
	'2001': new SupportCode('Missing name', 'Missing description', 'An error has occurred.\n\nPlease try again later.\n\nPlease note, if this error occurred\nwhile data was being written,\namiibo data may have been lost.', 'Missing fix', 'Missing link'),
	'9999': new SupportCode('Missing name', 'Missing description', 'An error occurred while trying to write\nor read amiibo data. Please turn off\nthe Wii U console and try again.\n\nIf the problem persists, please visit\nsupport.nintendo.com.', 'Missing fix', 'Missing link'),
};