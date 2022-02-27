const { task } = require('gulp');
var fs = require('fs');
var glob = require('glob');
const yaml = require('js-yaml');
var S = require('string');
var elasticlunr = require("elasticlunr");
// let SummarizerManager = require("node-summarizer").SummarizerManager;

// Specify input path to parse -- these files are expected to have YAML header containing their meta information
var path = {
  // 'content' : './content/**/*.+(md)'
  'content' : './content/posts/*.*'
};

var processMDFile = function() {
  var indexFiles = [];
  glob(path.content, function(err, files){
    if(err) {
      console.log(err);
    } else {
      files.forEach(function(file) {
        var content = fs.readFileSync(file, 'utf8');
        // console.log(content)
        content = content.split('---');
        // console.log("split: ");
        // console.log(content)
        var frontMatter = yaml.load(content[1].trim());
        // console.log(frontMatter);
        //console.log(content);

        // Get the main text content 
        // var text_summary = content[2].replace(/(([^\s]+\s\s*){70})(.*)/,"$1…");
        // console.log(text_summary)
        
        // Get a summary of the page
        // let Summarizer = new SummarizerManager(text_content,1);
        // console.log(Summarizer.getSummaryByFrequency().summary)

        // Build lunr index
        var index = {
          slug: frontMatter.slug,
          title: frontMatter.title,
          author: frontMatter.author,
          date: frontMatter.date,
          categories: frontMatter.categories,
          tags: frontMatter.tags,
          // summary: text_summary,
          content: S(content[2]).trim().stripTags().stripPunctuation().s
        };
        // console.log(index);
        indexFiles.push(index);
      });
    }
    //console.log(JSON.stringify(indexFiles));
    fs.writeFileSync('./search_index.json', JSON.stringify(indexFiles));
    // file('search_index.json', JSON.stringify(indexFiles), {src: true}).pipe(dest('./static/'));
  });
};

// Generate the actual index file
const generateLunarIndex = function(){
  var elastic_lunr_index = elasticlunr(function () {
    this.setRef('slug');
    this.addField('title');
    this.addField('author');
    this.addField('date');
    this.addField('categories');
    this.addField('tags');
    // this.addField('summary');
    // this.addField('content');
  });

  // Add the document in the json file to the search index
  fs.readFile('search_index.json', function (err, data) {
    if (err) throw err;

    // Put each item into the index
    var raw = JSON.parse(data);

    var docs = raw.map(function (doc) {
      return {
        slug: doc.slug, 
        title: doc.title,
        author: doc.author,
        date: doc.date,
        categories: doc.categories,
        tags: doc.tags,
        // summary: doc.summary,
        content: doc.content
      }
    });

    // console.log(docs);
    docs.forEach(function(doc){
      elastic_lunr_index.addDoc(doc);
    });
    // console.log(elastic_lunr_index);
    // console.log(elastic_lunr_index.search("markdown"));

    // Write the index to a file
    fs.writeFile('data/cached_index.json', JSON.stringify(elastic_lunr_index), function (err) {
      if (err) throw err;
      console.log('Search index file cache successfully written');
    });
  });

}

task("index", async function(done){
  generateLunarIndex()
  done()
});

task('process', async function(done) {
  processMDFile()
  done();
});


// exports.default = processMDFile
// exports.process = 

// gulp.task("build-templates", function(){
// 	var jsFunctionString = pug.compileFileClient('layouts/templates/summary.pug', {name: "summary_template"});
// 	fs.writeFileSync("static/js/templates.js", jsFunctionString);
// });
