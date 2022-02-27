// import hljs from 'highlight.js';
// npx tailwindcss -c tailwind.config.js -o _src/styles.css
const fs = require('fs');
const _ = require("lodash");
// var text_summary = require ("text-summary");
// var SummaryTool = require('node-summary');
// console.log("testing")

const moment = require('moment-timezone');
const summarize = require('text-summarization')
var hljs = require('highlight.js') // https://highlightjs.org/

var markdownIt = require('markdown-it');
const markdownItClass = require('@toycode/markdown-it-class');
const elasticlunr = require('elasticlunr');
const mathjaxPlugin = require("eleventy-plugin-mathjax");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const katex = require("katex");
//const markdownItKatex = require("markdown-it-katex");
const markdownItKatex = require("@iktakahiro/markdown-it-katex");
// const { FontAwesomeIcon } = require("@campj/eleventy-fa-icons");

module.exports = function(eleventyConfig) {
	// eleventyConfig.setPugOptions({ debug: true });
	// eleventyConfig.addLayoutAlias("base", "_includes/layouts/base.pug");

	// eleventyConfig.addNunjucksShortcode("FontAwesomeIcon", FontAwesomeIcon);

	// console.log(eleventyConfig);
	// eleventyConfig.addPlugin(mathjaxPlugin);
	eleventyConfig.setUseGitIgnore(true);
	eleventyConfig.addPlugin(syntaxHighlight);

	eleventyConfig.addPlugin(require('eleventy-plugin-heroicons'));
	
	// eleventyConfig.addFilter("latex", (content) => {
	// 	return content.replace(/\$\$(.+?)\$\$/g, (_, equation) => {
	// 		const cleanEquation = equation.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
	// 		return katex.renderToString(cleanEquation, { throwOnError: false });
	// 	});
	// });

	// Copy folders `x/` to `_site/x/`
	eleventyConfig.addPassthroughCopy({ "css": "css" });
	eleventyConfig.addPassthroughCopy({ "js": "js" });
	eleventyConfig.addPassthroughCopy({ "data": "data" });
	eleventyConfig.addPassthroughCopy({ "images": "images" });
	
	// Set markdown library
	// See: https://dev.to/matthewtole/eleventy-markdown-and-tailwind-css-14f8
	const md = markdownIt({ 
		linkify: true, 						// Autoconvert URL-like text to links
		html: true,					 			// Enable HTML tags in source
		typographer: false,				// Enable some language-neutral replacement + quotes beautification
		breaks: false
		// highlight: function (str, lang) {
		// 	if (lang && hljs.getLanguage(lang)) { 
		// 		try { return hljs.highlight(str, {language: lang}).value;} catch (__) {} 
		// 	}
		// 	return ''; // use external default escaping
		// }
	}).use(markdownItKatex);
	// md.use(mapping);
	eleventyConfig.setLibrary('md', md);

	// TODO: add filters to enable javascript functions that e.g. summarize text
	// eleventyConfig.addFilter("format_date", function(dateIn) {
	// 	// return moment(dateIn).tz('GMT').format('YYYY MMMM DD, dddd, HH:MM:SS z');
	// 	return dateIn.toLowerCase();
	// });

	// eleventyConfig.setPugOptions({
	// 	filters: {
	// 		"format_date": function(text) { 
	// 			//console.log(typeof text);  
	// 			//return moment(text).tz('GMT').format('YYYY MMMM DD, dddd, HH:MM:SS z');
	// 			return(text.toUpperCase())
	// 		}
	// 	}

	// });
	// eleventyConfig.addJavaScriptFunction("format_date", function(dateIn) { return dateIn });


	// Build the search index
	// var index = elasticlunr(function () {
	// 	this.addField('title');
	// 	this.addField('body');
	// 	this.setRef('id');
	// 	this.saveDocument(false);
	// });

	// Move search index to getJSON at runtime
	// fs.readFile('_data/search_index.json', function (err, data) {
	// 	if (err) {
	// 		console.log("Failed loading the search index")
	// 		throw err
	// 	};
	// 	console.log('Loading search index')
		
	// })

	// https://fuzzylogic.me/posts/flexible-tag-like-functionality-for-custom-keys-in-eleventy/
	eleventyConfig.addCollection("categories_list", function(collectionApi) {
		let category_set = new Set();
		collectionApi.getAll().forEach(item => {
			if ("categories" in item.data){
				item.data.categories.forEach(category => category_set.add(category));
			}
		});
		return([...category_set]);
	});
	eleventyConfig.addCollection("categories", function(collection) {
		let cat_collection = {};
		collection.getAll().forEach(function(item) {
			if(item.data["categories"]) {
				item_cats = item.data["categories"]
				item_cats.forEach(category => {
					if (!cat_collection[category]){
						cat_collection[category] = [];
					}
					cat_collection[category].push(item);
				});
			}
		});
		return cat_collection;
	});

	// summarize.summary(post.fileSlug, 1)
	return {
		templateFormats: [ "md", "liquid", "pug", "html" ], 
		dir: {
			input: "content",
			includes: "../_includes", 
			data: "../_data",
			output: "docs" // needed for GH pgaes
		}, 
		passthroughFileCopy: true
	};
};