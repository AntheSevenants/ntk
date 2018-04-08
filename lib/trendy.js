// You don't even know how much of a hack this is
// Look at the source at your own risk

translateTimeout = null;

// https://stackoverflow.com/a/41427131
alphabet = "abcdefghijklmnopqrstuvwxyz".split('');
alphabetPosition = text => 
  text.split('').map(x => alphabet.indexOf(x));

constituentCodes = {
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
}

function boot()
{
	textAreaSentence = document.getElementById("sentence");
	textAreaCorrection = document.getElementById("correction");
	divOutput = document.getElementById("output");

	textAreaCorrection.oninput = translate;
	textAreaSentence.oninput = translate;
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

			var realPreviousIndex = -1;
			var constituentsCopy = JSON.parse(JSON.stringify(output[i]));

			//console.log(output[i]);

			for (var p = 0; p < constituentsCopy.length; p++)
			{
				var fillBottom = realPreviousIndex + 1;
				var fillTop = constituentsCopy[p][2];

				if (fillBottom != fillTop)
				{
					//console.log("Filling from " + fillBottom + " to " + fillTop);
	
					var fillerConstituent = "";
					for (var k = fillBottom; k < fillTop; k++)
					{
						fillerConstituent += words[k] + " ";
					}
	
					output[i].push([ fillerConstituent, "x", fillBottom, fillTop ]);
				}
				else
				{
					//console.log(fillBottom + " matches " + fillTop);
				}

				realPreviousIndex = constituentsCopy[p][3];
			}

			output[i].sort(Comparator);
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

	if (typeof constituentCodes[constituentFunction] != "undefined")
	{
		constituentDiv.title = constituentCodes[constituentFunction];
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