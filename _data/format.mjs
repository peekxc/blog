import { moment } from 'moment-timezone';
const _ = require("lodash");
const stripHtml = require("string-strip-html");
let SummarizerManager = require("node-summarizer").SummarizerManager;



module.exports = {
	date: function(text) { return moment(text).tz('America/New_York').format('MMMM Do, YYYY'); },
	summary: function(text){ 
		const text_result = stripHtml(text).result;
		let Summarizer = new SummarizerManager(text_result,5); 
		// console.log(stripHtml(text).result)
		//console.log(Summarizer.getSummaryByFrequency().summary)
		//return stripHtml(text).result; 
		return text_result;
	}
}
// module.exports = {
//   "format_date": function(text){
// 		return(text.toLowerCase());
// 	}
// };