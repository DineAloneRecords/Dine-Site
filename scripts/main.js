'use strict';

// Create a global object for the app called 'app'
var app = {};

var dineAloneArtists = ['…And You Will Know Us By The Trail Of Dead', 'Aero Flynn', 'Alberta Cross', 'Alexisonfire', 'At The Drive-In', 'Attack in Black', 'Billy Bragg', 'Black Lungs', 'Black Mountain', 'BR/DGES', 'Brendan Philip', 'BRONCHO', 'Chuck Ragan', 'City and Colour', 'Craig Finn', 'Dave Monks', 'Delta Spirit', 'Diarrhea Planet', 'Dicey Hollow', 'Dune Rats', 'DZ Deathrays', 'Eagulls', 'Elliot Moss', 'FIDLAR', 'Field Report', 'Fine Points', 'Fireside', 'Fly Golden Eagle', 'Gateway Drugs', 'Grade', 'Hannah Georgas', 'HBS', 'Heartless Bastards', 'Hey Rosetta!', 'Heyrocco', 'High Ends', 'Ivan & Alyosha', 'James Vincent McMorrow', 'JEFF The Brotherhood', 'Jimmy Eat World', 'k-os', 'Kate Nash', 'Kopecky', 'Langhorne Slim & The Law', 'Lieutenant', 'Little Scream', 'Lucius', 'Marilyn Manson', 'Matthew Logan Vasquez', 'Miami Horror', 'Moneen', 'Monster Truck', 'Music Band', 'Neverending White Lights', 'Noah Gundersen', 'Oh Pep!', 'PHOX', 'RNDM', 'Rumba Shaker', 'Say Yes', 'Sego', 'Shovels & Rope', 'Single Mothers', 'Sleepy Sun', 'Solids', 'Spanish Gold', 'Spencer Burton', 'Streets of Laredo', 'Swervedriver', 'Sylvan Esso', 'The Amazing', 'The Cult', 'The Dandy Warhols', 'The Dirty Nil', 'The Dodos', 'The Jezabels', 'The Lumineers', 'The Sheepdogs', 'The Wytches', 'Tokyo Police Club', 'Twin Forks', 'Vanessa Carlton', 'Vanishing Life', 'Violent Soho', 'Walter Schreifels', 'Wild Child', 'Wintersleep', 'Yukon Blonde'];

// Temporary Array for testing.
app.tempArray = ['arkells', 'Wintersleep', 'You+Me', 'Yukon Blonde'];

// Create an empty array into which we can push our artists that have been searched/viewed
app.artists = [];

// Create an empty array of songs
app.songs = [];

// Create an empty array of artists that have been addedToPlaylist
app.addedArtists = [];

// Create an object of artists for the purpose of having a key that the artistCardTemplate will use (keyname: artist).
app.artistObj = {
	artists: dineAloneArtists.map(function (artist) {
		return {
			name: artist
		};
	})
};

// Select html from handlebars template
app.artistCardTemplate = $('#artistCardTemplate').html();
// Compile html for handlebars template
app.template = Handlebars.compile(app.artistCardTemplate);

// Added artist Handlebars template
// Select html from handlebars template
app.addedArtistsTemplate = $('#addedArtistsTemplate').html();
// Compile html for handlebars template
app.addedTemplate = Handlebars.compile(app.addedArtistsTemplate);

// Create an app.init function to run that will house all functions that are initialized when the page loads
app.init = function () {
	app.searchButtonListener();
	app.addToPlaylistListener();
	app.closeArtistContainerListener();
	app.startButton();
	app.events();
	app.closeSpotifyContainerListener();
	app.littleImageListener();
};

app.events = function () {
	$('.play').on('click', function () {
		app.createPlaylistListener();
		$('.spotifyContainer').css('display', 'flex');
		$('.searchForm').hide();
		$('.artistsContainer').hide();
		$('.addedArtistsContainer').hide();
	});
};
// app.getArtistsInfo loops through an array and gets calls the getData method to get the artist object from spotify. Note: the getData method also appends the artist object returned from spotify to the handlebars artistCardTemplate.
app.getArtistsInfo = function (arrayName) {
	// console.log(arrayName);
	arrayName.forEach(function (artistName) {
		app.getData(artistName);
	});
};

// Create a method to get artists from spotify that requires an input of the artist name
// The query filters for artists and guarantees the search term in the artist name.
app.getData = function (artistName) {
	$.ajax({
		url: "https://api.spotify.com/v1/search",
		method: 'GET',
		dataType: 'json',
		data: {
			q: artistName + " artist:" + artistName,
			type: 'artist',
			artist: artistName
		}
	}).then(function (res) {
		app.artists = [];
		$('.artistsContainer').empty();
		$('.artistsContainer').html('<i class="fa fa-times-circle" aria-hidden="true"></i>');
		// $('.artistsContainer').html('<img src="assets/close.png" alt="" />')
		app.artists.push(res.artists.items[0]);
		$('.artistsContainer').append(app.template(res.artists.items[0]));
		app.checkAddToPlaylistStatus();
	});
};

// Create a function to get songs based on an artist ID.
// method requires an artistID, a country code (e.g. CA)
app.getSongs = function (artistID) {
	return $.ajax({
		url: "https://api.spotify.com/v1/artists/" + artistID + "/top-tracks",
		method: 'GET',
		dataType: 'json',
		data: {
			country: 'CA'
		}
	});
};

app.createPlaylistListener = function () {
	console.log('app.createPlaylistListener is running.');
	var counter = 0;
	for (var i = 0; i < app.addedArtists.length; i++) {
		app.getSongs(app.addedArtists[i]).then(function (res) {
			// console.log(res);
			counter++;
			for (var i = 0; i < 5; i++) {
				app.songs.push(res.tracks[i].id);
			}
			if (counter === app.addedArtists.length) {
				console.log('in here');
				console.log(app.songs);
				app.createPlaylist();
			}
		});
	}
};

$(function () {
	app.init();
	// Close addedArtistsContainer on click
	$('.closeAddedArtistsButton').on('click', function () {
		$('.addedArtistsContainer').removeClass('show');
	});
});

// add in jquery plug in to auto complete search bar

$('#autocomplete').autocomplete({
	lookup: dineAloneArtists,
	transformResult: function transformResult(response) {
		return {
			suggestions: $.map(response.myData, function (dataItem) {
				return { value: dataItem.valueField, data: dataItem.dataField };
			})
		};
	}
});

// add in jquery for accordian

// make var for user choice of artist and function for on change or on select or on enter
//IN HERE
app.searchButtonListener = function () {
	$('form').on('submit', function (e) {
		var userArtistChoice = [];
		e.preventDefault();
		var artist = $('.searchFormInput').val();

		// check to see if artist name exists in our dineAloneArtists if they dont not search and then send message. if they do then send call
		if (dineAloneArtists.indexOf(artist) >= 0) {
			userArtistChoice.push(artist);
			app.getArtistsInfo(userArtistChoice);
			$('.searchFormInput').val('');
			// console.log("The button was pressed");
			// console.log(artist);
			app.hideSearchForm();
		} else if (artist === "heather") {
			userArtistChoice.push("Taylor Swift");
			app.getArtistsInfo(userArtistChoice);
			$('.searchFormInput').val('');
			// console.log("The button was pressed");
			// console.log(artist);
			app.hideSearchForm();
		} else {

			// console.log("Sorry that is not one of our Artists");
			// $('.searchFormInput').val("That's not one of our artists...");
			$('.searchFormInput').focus();
			$('.searchFormInput').addClass('wrong');
			$('.searchFormInput').addClass('animated shake');
			setTimeout(function () {
				$('.searchFormInput').removeClass('animated shake');
				$('.searchFormInput').removeClass('wrong');
				$('.searchFormInput').val('');
			}, 1000);
		}
		// userArtistChoice.push(artist);
		// $('.searchFormInput').val('');
		// app.getArtistsInfo(userArtistChoice);
	});
};

// Create a function to check if artist being shown is already addedToPlaylist
// for loop to go through each artist id in the app.addedArtists array
// if data attribute in current artistCardTemplate is equal to it
// add addToPlaylistPressed class
app.checkAddToPlaylistStatus = function () {
	console.log('app.checkAddToPlaylistStatus is running!');
	for (var i = 0; i < app.addedArtists.length; i++) {
		// console.log(i);
		var currentArtistID = $('.artistsContainer').find('.addToPlaylist').data();
		// console.log($('.artistsContainer').find('.addToPlaylist').data());
		if (currentArtistID.artist === app.addedArtists[i]) {
			$('.artistsContainer').find('.addToPlaylist').addClass('addToPlaylistPressed');
			$('.artistsContainer').find('.addToPlaylist').text('Remove');
			// console.log(app.addedArtists[i], "if is working");
		};
		// if (dynamically create id = i.id)
	}
};

// Create a listener to add currently displayed artist to addedArtists artist on click of addToPlaylist, and...
// change the appearance of addToPlaylist to appear added and
app.addToPlaylistListener = function () {
	console.log('addtoplaylistisnowlistening');
	$('.artistsContainer').on('click', ".addToPlaylist", function () {
		// Check if artists id is already in app.addedArtists

		var index = app.addedArtists.indexOf(app.artists[0].id);
		console.log(index);
		if (index >= 0) {
			app.addedArtists.splice(index, 1);
			console.log('i have removed item number ', index);
			console.log(app.addedArtists);
			$('.addToPlaylist').removeClass('addToPlaylistPressed');
			$('.artistsContainer').find('.addToPlaylist').text('Add to Playlist');
			// Remove Artist from addedArtistContainer if already present
			$('.addedArtistsContainer .addedArtistsCard[data-addedartist="' + app.artists[0].id + '"]').remove();
		} else {
			if (app.addedArtists.length < 4) {
				console.log('i am new, add to addedArtists array');
				app.addedArtists.push(app.artists[0].id);
				console.log(app.addedArtists);
				$('.addToPlaylist').addClass('addToPlaylistPressed');
				$('.artistsContainer').find('.addToPlaylist').text('Remove');
				// Send artist to added artists template in addedArtistContainer
				$('.addedArtistsContainer').append(app.addedTemplate(app.artists[0]));
				$('.addedArtistsContainer').addClass('show');
			} else {
				$('.artistsContainer').find('.artistCardImgContainer').append("<div class='alert'><i class='fa fa-times-circle' aria-hidden='true'></i><p>Four artists have been chosen. You can create your playlist now or choose different artists.</p></div>");
			}
		}
		// console.log('add to play list listener is working')

		// Show addedArtistsContainer
	});
};

// we want to do whatever we need to do to build a playlist in our page

// Temporarily use start button to lauch splashHideFormLoad
app.startButton = function () {
	$('.startButton').on('click', function () {
		app.splashHideFormLoad();
	});
};

// Join all spotify song IDs into one string and create into URL for spotify player
// concat user selected into one comma separated string and store in variable

app.createPlaylist = function () {
	// Create a string of all song IDs from the app.songs array and store it in the spotifySongListChain
	var spotifySongListChain = app.songs.join(',');
	// create iframe html code that uses spotifySongListChain to dynamically create an iframe, store it in a widgetCode variable, and....
	var widgetCode = '<i class="fa fa-times-circle" aria-hidden="true"></i><iframe class="spotify" src="https://embed.spotify.com/?uri=spotify:trackset:DineAloneRecords:' + spotifySongListChain + '" width="300" height="400" frameborder="0" allowtransparency="true"></iframe>';
	// insert it into the spotifyContainer in the html using the widgetCode
	$('.spotifyContainer').html(widgetCode);
};

// create timed function that will fade from splash to search page on load.
app.splashHideFormLoad = function () {
	// setTimeout(function(){
	$('.splash img').hide("slow", "swing");
	setTimeout(function () {
		$('.splash').addClass('shrinkSplash');
		setTimeout(function () {
			$('.splash').hide("fast", "swing");
			setTimeout(function () {
				$('.searchForm').show("slow", "swing");
			}, 100);
		}, 250);
	}, 1000);
	// }, 2000);
};

// Create a timed function that will hide the searchForm and show the artistsContainer
app.hideSearchForm = function () {
	$('.searchForm').hide("slow", "swing");
	$('.artistsContainer').addClass("showArtistContainer");
};

app.closeArtistContainerListener = function () {
	$('.artistsContainer').on('click', '.fa-times-circle', function () {
		app.showSearchForm();
	});
};

// Create a timed function that will show the searchForm
app.showSearchForm = function () {
	$('.searchForm').show("fast", "swing");
	$('.artistsContainer').removeClass("showArtistContainer");
	$('.artistsContainer').empty();
};

app.closeSpotifyContainerListener = function () {
	$('.spotifyContainer').on('click', '.fa-times-circle', function () {
		$('.spotifyContainer').empty();
		app.songs = [];
		$('.spotifyContainer').css('display', 'none');
		$('.addedArtistsContainer').css('display', 'flex');
		$('.searchForm').css('display', 'flex');
	});
};

app.littleImageListener = function () {
	$('.addedArtistsContainer').on('click', '.removeImg', function (e) {
		console.log(this);

		var thisArtist = $(this).closest('.addedArtistsCard').data();
		var thisArtistId = thisArtist.addedartist;
		for (var i = 0; i < app.addedArtists.length; i++) {
			if (app.addedArtists[i] === thisArtistId) {
				app.addedArtists.splice(i, 1);
			}
		}
		console.log(app.addedArtists);

		$(this).closest('.addedArtistsCard').remove();
		app.showSearchForm();
	});
};

// BONUS: we can use the spotify artist id to get the songkick artist upcoming events