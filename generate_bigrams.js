var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const fs = require('fs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const MIN_FREQUENCY_TO_STORE = 2; // erase all words with frequency of 1

const listPaths = [
    './lists/wikipediaaa.txt',
    './lists/wikipediaab.txt',
    './lists/wikipediaac.txt',
    './lists/wikipediaad.txt',
    './lists/wikipediaae.txt',
    './lists/wikipediaaf.txt',
    './lists/wikipediaag.txt',
    './lists/wikipediaah.txt',
    './lists/wikipediaai.txt',
    './lists/wikipediaaj.txt',
]

const BIGRAM_PATH = './bigram';
const FREQ_PATH = './freq';

// bigram map of int - two keys
var bigrams = new Map();
// freq map of int - one key
var freq = new Map();
try {
      // Load the source text from clean word list

      for (var listPath of listPaths) {
	  console.log('Reading ' + listPath);
  	  let sentences = fs.readFileSync(listPath).toString().split('\n');	  
	  
  	  // for each sentence
  	  sentences.forEach(function(sentence) {
  	      // for every word in the sentence
  	      let prev = "";
	      
	      // Skip sentences with fewer than 4 words
	      if (sentence.split(' ').length < 4) return;
  	      sentence.split(' ').forEach(function(word) {
      		  // increment frequency map
		  // make sure the word is lowercase,
		  // and remove everything that's not
		  // a letter or an apostrophe (for contractions)
		  word = word.toLowerCase().replace(/[^a-zA-Z']+/g, '')
		  if (word.length == 0) return;
      		  if (freq.get(word) === undefined) {
      		      freq.set(word,1);
      		  } else {
      		      freq.set(word,freq.get(word)+1);
      		  }
		  
      		  // increment bigrams map
      		  if (prev != "") {
    		      let bigram = JSON.stringify([prev,word]);
    		      if (bigrams.get(bigram) === undefined) {
    			  bigrams.set(bigram,1);
    		      } else {
    			  bigrams.set(bigram,bigrams.get(bigram)+1);
    		      }
      		  }
      		  prev = word;
  	      })
  	  })
	 
      } // END FOR listPath in listPath
      
      console.log("Trimming maps for memory");
      let wordCount = freq.size;
      let wordsErased = 0;
      let wordsToDeleteFromBigram = [];
      freq.forEach((frequency,key) => {
	  if (frequency < MIN_FREQUENCY_TO_STORE) {
	      wordsToDeleteFromBigram.push(key);
	      freq.delete(key);
	      wordsErased++;
	  }
      })
      // also delete bigrams with the words to delete
      // in the first or the second position
      bigrams.forEach((f,k) => {
	  let keyArray = JSON.parse(k);
	      for (var element of wordsToDeleteFromBigram) {
		  if (keyArray[0] == element || keyArray[1] == element) {
		      console.log("Deleting " + k);
		      bigrams.delete(k);
		      break;
		  }
	      }
      })
      let remaining = wordCount - wordsErased;
      console.log("Deleted " + wordsErased + " of " + wordCount
		  + " words (" + remaining + " remain)");
      
      console.log("Read in word lists, writing objects to file...");

      // write bigram and freq maps out
      fs.writeFileSync(BIGRAM_PATH,JSON.stringify(bigrams));
      console.log("Bigrams written to file");
      fs.writeFileSync(FREQ_PATH,JSON.stringify(freq));
      console.log("Freq written to file");

} catch(e) {
    console.error(e);
}
