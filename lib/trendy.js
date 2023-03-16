// This is the source code for the exercise parsing of the exercises in Nederlandse taalkunde I
// The code is based on my hacky version from 2018 (which is still in the source tree),
// but adapted for the new syntax introduced in the course in 2019.
// The old parsing remains available as well through a get parameter

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

translateTimeout = null;

// https://stackoverflow.com/a/41427131
alphabet = "abcdefghijklmnopqrstuvwxyz".split('');
alphabetPosition = text => 
  text.split('').map(x => alphabet.indexOf(x));
alphabetPositionUnique = x => alphabet.indexOf(x);

let constituentCodeMode = "2019";

constituentCodes = {
	"pre2019": {
		"10": "Onderwerp",
		"11": "Eigenlijk onderwerp",
		"12": "Voorlopig onderwerp",
		"13": "Herhalend onderwerp",
		"14": "Loos onderwerp",
		"15": "Plaatsonderwerp",
		"21": "Werkwoordelijk gezegde",
		"22": "Persoonsvorm van het werkwoordelijk gezegde",
		"23": "Werkwoordelijke rest van het werkwoordelijk gezegde",
		"24": "Niet-werkwoordelijk deel van het werkwoordelijk gezegde",
		"25": "Naamwoordelijk gezegde",
		"26": "Persoonsvorm van het naamwoordelijk gezegde",
		"27": "Niet-werkwoordelijk deel van het naamwoordelijk gezegde",
		"28": "Werkwoordelijke rest van het naamwoordelijk gezegde",
		"30": "Lijdend voorwerp",
		"31": "Eigenlijk lijdend voorwerp",
		"32": "Voorlopig lijdend voorwerp",
		"33": "Herhalend lijdend voorwerp",
		"35": "Oorzakelijk voorwerp",
		"36": "Eigenlijk oorzakelijk voorwerp",
		"37": "Voorlopig oorzakelijk voorwerp",
		"38": "Herhalend oorzakelijk voorwerp",
		"40": "Meewerkend voorwerp",
		"41": "Eigenlijk meewerkend voorwerp",
		"42": "Voorlopig oorzakelijk voorwerp",
		"43": "Herhalend oorzakelijk voorwerp",
		"50": "Voorzetselvoorwerp",
		"51": "Eigenlijk voorzetselvoorwerp",
		"52": "Voorlopig voorzetselvoorwerp",
		"53": "Herhalend voorzetselvoorwerp",
		"61": "Voorwerp van plaats",
		"62": "Voorwerp van richting",
		"63": "Voorwerp van maat",
		"64": "Voorwerp van wijze",
		"65": "Voorwerp van tijd/duur",
		"68": "Voorwerp van bron",
		"69": "Bepaling van de handelende persoon",
		"70": "Bijwoordelijke bepaling (van modaliteit, ontkenning, middel, gevolg, vergelijking, beperking, verhouding)",
		"71": "Bijwoordelijke bepaling van plaats",
		"72": "Bijwoordelijke bepaling van richting",
		"73": "Bijwoordelijke bepaling van maat",
		"74": "Bijwoordelijke bepaling van wijze",
		"75": "Bijwoordelijke bepaling van tijd/duur",
		"76": "Bijwoordelijke bepaling van oorzaak/reden",
		"77": "Bijwoordelijke bepaling van doel",
		"78": "Bijwoordelijke bepaling van voorwaarde",
		"79": "Bijwoordelijke bepaling van toegeving",
		"80": "Predicatieve bepaling",
		"81": "Predicatief complement",
		"90": "Bijvoeglijke bepaling"
	}, "2019": {
		"20": "PV",
		"21": "niet‐finiet werkwoordelijk deel",
		"21+": "niet‐finiet werkwoordelijk deel (voorlopig/herhalend)",
		"22": "niet‐werkwoordelijk deel",
		"22+": "niet‐werkwoordelijk deel (voorlopig/herhalend)",
		"23": "naamwoordelijk gezegde",
		"10": "onderwerp",
		"10+": "subjectscomplement / onderwerp (voorlopig/herhalend)",
		"30": "lijdend voorwerp",
		"30+": "objectscomplement / lijdend voorwerp (voorlopig/herhalend)",
		"40": "meewerkend voorwerp",
		"40+": "meewerkend voorwerp (voorlopig/herhalend)",
		"50": "voorzetselvoorwerp",
		"50+": "voorzetselvoorwerp (voorlopig/herhalend)",
		"61": "plaatsvoorwerp",
		"61+": "plaatsvoorwerp (voorlopig/herhalend)",
		"62": "richtingsvoorwerp",
		"62+": "richtingsvoorwerp (voorlopig/herhalend)",
		"63": "maatvoorwerp",
		"63+": "maatvoorwerp (voorlopig/herhalend)",
		"64": "voorwerp van wijze",
		"64+": "voorwerp van wijze (voorlopig/herhalend)",
		"65": "voorwerp van duur",
		"65+": "voorwerp van duur (voorlopig/herhalend)",
		"70": "bwb. (restcategorie)",
		"70+": "bwb. (restcategorie) (voorlopig/herhalend)",
		"71": "bwb. van plaats",
		"71+": "bwb. van plaats (voorlopig/herhalend)",
		"72": "bwb. van richting/pad",
		"72+": "bwb. van richting/pad (voorlopig/herhalend)",
		"73": "bwb. van maat/graad/hoeveelheid",
		"73+": "bwb. van maat/graad/hoeveelheid (voorlopig/herhalend)",
		"74": "bwb. van wijze",
		"74+": "bwb. van wijze (voorlopig/herhalend)",
		"75": "bwb. van tijd/duur",
		"75+": "bwb. van tijd/duur (voorlopig/herhalend)",
		"90": "bijvoeglijke bepaling",
		"90+": "bijvoeglijke bepaling (voorlopig/herhalend)",
		"91": "interne bijwoordelijke bepaling",
	}
}

function boot()
{
	textAreaSentence = document.getElementById("sentence");
	textAreaCorrection = document.getElementById("correction");
	divOutput = document.getElementById("output");

	setTranslationFunctions();
}

function setTranslationFunctions() {
	if (!(urlParams.has("pre2019"))) {
		textAreaCorrection.oninput = translate2019;
		textAreaSentence.oninput = translate2019;

		translate2019();

		constituentCodeMode = "2019";
	} else {
		textAreaCorrection.oninput = translate;
		textAreaSentence.oninput = translate;

		translate();
		
		constituentCodeMode = "pre2019";
	}
}

function translate()
{
	clearTimeout(translateTimeout);

	translateTimeout = window.setTimeout(function()
	{
		output = [];

		sentence = textAreaSentence.value;
		var words = sentence.split(" ");

		correction = textAreaCorrection.value;
		codelevels = correction.split("\n");

		///
		
		for (var i = 0; i < codelevels.length; i++)
		{
			//console.log("Level " + i);

			var codes = codelevels[i].split(" ");
			output[i] = [];

			var previousIndex = -1;

			for (var j = 0; j < codes.length; j++)
			{
				var regex = /([a-z+]{1,})([0-9]+)/gi;
				var matches = null;
				matches = regex.exec(codes[j].toLowerCase());

				if (matches)
				{
					var letters = matches[1].split("+");

					for (var l = 0; l < letters.length; l++)
					{
						//console.log("Now doing: " + codes[j]);

						var positions = alphabetPosition(letters[l]);
						var constituent = "";
	
						var newPreviousIndex = null;
						var previousIndexLimit = positions[0];
	
						if (positions.length == 1)
						{
							constituent = words[positions[0]];
							newPreviousIndex = positions[0];
						}
						else
						{
							for (var k = positions[0]; k <= positions[1]; k++)
							{
								constituent += words[k] + " ";
							}
	
							newPreviousIndex = positions[1];
						}
	
						//console.log("Previous index was: " + previousIndex);
						//console.log("Current index limit is: " + previousIndexLimit);
	
						//0 get: words, 1: function, 2: lower limit, 3: upper limit
						output[i].push([ constituent, matches[2], positions[0], newPreviousIndex ]);
	
						previousIndex = newPreviousIndex;
					}			
				}
				else
				{
					//console.log("Error for code " + codes[j]);
				}
			}

			output[i].sort(Comparator);
			output[i] = fillInEmpty(output[i], words);
		}

		render(output);
	}, 20);
}

function fillInEmpty(outputRow, words) {
	var realPreviousIndex = -1;
	var constituentsCopy = JSON.parse(JSON.stringify(outputRow));

	// console.log(outputRow);

	for (var p = 0; p < constituentsCopy.length; p++) {
		var fillBottom = realPreviousIndex + 1;
		var fillTop = constituentsCopy[p][2];

		if (fillBottom != fillTop) {
			//  console.log("Filling from " + fillBottom + " to " + fillTop);

			var fillerConstituent = "";
			for (var k = fillBottom; k < fillTop; k++) {
				fillerConstituent += words[k] + " ";
			}

			outputRow.push([fillerConstituent, "x", fillBottom, fillTop]);
		}
		else {
			// console.log(fillBottom + " matches " + fillTop);
		}

		realPreviousIndex = constituentsCopy[p][3];
	}

	outputRow.sort(Comparator);

	return outputRow;
}

function translate2019()
{
	clearTimeout(translateTimeout);

	translateTimeout = window.setTimeout(function()
	{
		output = [];

		let sentence = textAreaSentence.value;
		sentence = sentence.replace(/\s\s+/g, " ");

		const words = sentence.split(" ");

		correction = textAreaCorrection.value;
		correction = correction.replace(/\s\s+/g, " ")
							   .replace(/’/g, "'")
							   .replace(/[”"]/g, "''");
		codeLevels = correction.split("\n");

		// For each level in the correction code, iterate
		for (let level = 0; level < codeLevels.length; level++)
		{
			// console.log("Level " + level);

			// Retrieve the different codes on this level
			// These are normally separated by spaces, but just to be safe I use regex
			let codes = codeLevels[level].match(/([a-z']{1,}[0-9+]+)/gi);

			// Prepare output for this level by setting an empty list
			output[level] = [];

			let previousIndex = -1;

			// Parse each code individually
			for (let codeIndex = 0; codeIndex < codes.length; codeIndex++)
			{
				// Find constituent indices and constituent function using regex
				let regex = /([a-z']{1,})([0-9+]+)/gi;
				let matches = null;
				matches = regex.exec(codes[codeIndex].toLowerCase());

				// If valid input was given...
				if (matches)
				{
					// First, we isolate the letters
					// Warning, this included the apostrophes!
					let letters = matches[1];
					let constituentFunctionCode = matches[2];

					let letterSplitRegex = /([a-z][']*)([a-z][']*)?/gi;
					let letterMatches = null;
					letterMatches = letterSplitRegex.exec(letters);

					// Some error?
					if (letterMatches == null) {
						continue;
					}

					// Deduce all letter clusters
					letterMatches = letterMatches.slice(1)
												 .filter(letterMatch => letterMatch != undefined);
					
					let beginPosition = -1;
					let endPosition = -1;

					// Iterate over each cluster
					for (let letterIndex = 0; letterIndex < letterMatches.length; letterIndex++) {
						const letterCluster = letterMatches[letterIndex];
						// The letter is always the first character in the cluster
						const letter = letterCluster.slice(0, 1);
						// First, get the basic position of the cluster
						let position = alphabetPositionUnique(letter);
						// Then, add the ' contributions (each ' = 26)
						position = position + (26 * (letterCluster.length - 1));

						// console.log(letterCluster, letter, position);

						// If this is the first item in the list (= 0), set this
						// position as the begin position
						if (letterIndex == 0) {
							beginPosition = position;
						}
						// Always set the end position. If there is a letter after
						// this letter, it will be overwritten
						endPosition = position;
					}

					// Now that we have the begin and end positions, we can compose
					// the constituent from the different words
					let constituent = "";
					for (let position = beginPosition; position <= endPosition; position++) {
						//console.log(position, words[position]);
						constituent += words[position] + " ";
					}

					// Finally, push the constituent to the output
					output[level].push([ constituent, constituentFunctionCode, beginPosition, endPosition ]);
				}
				else
				{
					console.log("Error for code " + codes[codeIndex]);
				}
			}

			output[level].sort(Comparator);
			output[level] = fillInEmpty(output[level], words);
		}

		render(output);
	}, 20);
}

function render(output)
{
	divOutput.innerHTML = "";

	for (var i = 0; i < output.length; i++)
	{
		var levelDiv = createLevel();

		for (var j = 0; j < output[i].length; j++)
		{
			////console.log(output[i][j]);
			levelDiv.innerHTML += " "+ createConstituent(output[i][j][0], output[i][j][1]).outerHTML;
		}

		divOutput.appendChild(levelDiv);
	}
}

function Comparator(a, b)
{
   if (a[2] < b[2]) return -1;
   if (a[2] > b[2]) return 1;
   return 0;
 }

function createLevel()
{
	var levelDiv = document.createElement("div");
	levelDiv.className = "level";

	return levelDiv;
}

function createConstituent(words, constituentFunction)
{
	var constituentDiv = document.createElement("div");
	constituentDiv.className = "constituent";
	constituentDiv.innerHTML = words;

	if (constituentCodeMode != "2019" &&
		typeof constituentCodes[constituentCodeMode][constituentFunction] != "undefined") {
		constituentDiv.title = constituentCodes[constituentCodeMode][constituentFunction];
	}

	var functionDiv = document.createElement("div");
	functionDiv.className = "function";
	functionDiv.innerHTML = constituentFunction;

	constituentDiv.appendChild(functionDiv);

	if (constituentFunction == "x")
	{
		constituentDiv.style.visibility = "hidden";
	}

	return constituentDiv;
}