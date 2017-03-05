
/* ============================================================ 
  Global Variables
=============================================================== */

var $overlay = $('<div id="overlay"></div>');
var $img = $(".slideContainer img");
var $slideContainer = $('<div id="slide-container">');
var $previousButton = $('.previous-btn');
var $nextButton = $('.next-btn');

// Append element
$("body").append($overlay);
$overlay.append($previousButton);
$overlay.append($slideContainer);
$overlay.append($nextButton);

// Hide element
$overlay.hide();
$nextButton.hide();
$previousButton.hide();

var selected="";
var items = [];
var tracks = [];
var currentIndex = 0;


/* ============================================================ 
  Connect to api / retrieve data
=============================================================== */

// Get api option from switch button
function apiSwitch() {
  if( document.querySelector(".switch-input").checked ) {
    return "spotify";
  } else {
    return "flicker";
  }
}

// Form submittion
$('form').submit( function ( evt ) {
	evt.preventDefault();
	var api = apiSwitch();
	var $submitButton = $('#submit');
	var $searchField = $('#search');
	var query = $searchField.val();


	$searchField.prop("disabled",true);
	$searchField.attr("disabled", true).val("searching....");
	
	// Spotify api
	var spotifyAPI = 'https://api.spotify.com/v1/search';
	var spotifyOptions = {
	  type : "album",
	  q : query,
	  limit: 10
	};

	// Flicker api
	var flickrAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
	var flickrOptions = {
		tags: query,
		format: "json"
	}

	if( api === "spotify" ) {
		getApi( spotifyAPI, spotifyOptions, getSpotifyItems );
	} else {
		getApi( flickrAPI, flickrOptions, getFlickrItems );
	} 
	// Display sort by options
	showSortOptions();
	$searchField.prop("disabled", false);
	$searchField.attr("disabled", false).val("Search");	

}); // end form


// Connect to api and retrieve data
function getApi ( apiUrl, options, getItems ) {
	$.getJSON( apiUrl, options, getItems )
		// Show error if connection failed
		.fail( function( jqxhr, textStatus, error ) {
		    var err = textStatus + ", " + error;
		    console.log( err );
	});
}

// Get spotify items
function getSpotifyItems( data ) {
	// Clear previous search items
	items = [];
    $.each( data.albums.items, function( index, item ) {
      	var itemObj = {
      		artist: item.artists[0].name,
  			album: item.name,
  			imgUrl: item.images[1].url,
  			id: item.id,
  			tracks: getSpotifyTracks(item.id)
      	};         	
     	items.push(itemObj);
    }); // end each


    displayGallery();
}

// Get spotify alum tracks
function getSpotifyTracks( id ) {
	var tracks=[];
	var trackUrl = "https://api.spotify.com/v1/albums/" + id + "/tracks";
	var trackOptions = {
		limit: 10
	}

	$.getJSON( trackUrl, trackOptions, function( data ){
		$.each(data.items, function( index, item ){
			var trackObj = {
				track: item.name
			};
			tracks.push(trackObj);
		}); // end each		
	}); // end json
	return tracks;	
}

// Get flicker items
function getFlickrItems( data ) {
	// Clear previous search items
	items = [];
    $.each( data.items, function( index, item ) {
      	var itemObj = {
  				imgUrl: item.media.m,
  				published: item.published,
  				author: item.author
      	};         	
     	items.push(itemObj);
    }); // end each
  	
    displayGallery();
}


/* ============================================================ 
  Sort Buttons click event
=============================================================== */

// Show sort optionss
function showSortOptions (){
	var api = apiSwitch();
	$('.sort').show(200);
	if ( api === "spotify" ) {
		console.log('spotify')
		$('.sort-opt1').text('Artist');
		$('.sort-opt2').text('Album');
	} else {
		$('.sort-opt1').text('Author');
		$('.sort-opt2').text('Date');
	}
}

// Sort option1 button click event
$('.sort-opt1').click( function(){
	var api = apiSwitch();
	$("button").removeClass("selected");
	$(this).addClass('selected');
	items.sort( function( a, b ){
		if ( api === "spotify" ) {
		    var nameA = a.artist.toLowerCase(), 
		    	nameB = b.artist.toLowerCase()
		    if (nameA < nameB) //sort string ascending
		        return -1; 
		    if (nameA > nameB) //sort string descending
		        return 1; 
		    return 0; //default return value (no sorting)
		} else {
			var nameA = a.author.toLowerCase(), 
				nameB = b.author.toLowerCase()
			if (nameA < nameB) 
			    return -1; 
			if (nameA > nameB)
			    return 1;
			return 0; 
		}
	}); // end sort
 
   displayGallery();
});



// Sort option2 button click event
$('.sort-opt2').click( function(){
	var api = apiSwitch();
	$("button").removeClass("selected");
	$(this).addClass('selected');
	items.sort( function( a, b ){
		if ( api === "spotify" ) {
			var nameA = a.album.toLowerCase(),  
		    	nameB = b.album.toLowerCase()
		    if (nameA < nameB) 
		        return -1; 
		    if (nameA > nameB) 
		        return 1; 
		    return 0;
		} else {
			// Convert date to milliseconds
			var dateA = Date.parse(a.published), 
			 	dateB = Date.parse(b.published)
			return dateA-dateB;
		}
	}); // end sort
 
   displayGallery();
});





/* ============================================================ 
  Display gallery / lightbox
=============================================================== */


// Display gallery
function displayGallery() {
	var itemHTML = '';

	if (items.length > 0 ) {
		$.each( items, function( index, item ) {
		   itemHTML += '<li class="photo">';
		   itemHTML += '<a href="' + item.imgUrl + '">';
		   itemHTML += '<img src="' + item.imgUrl + ' "></a></li>';  
		});
	} else {
		itemHTML = 'No photos found that match';
	}
	$('#photos').html(itemHTML);

}

// Show slide
function displaySlide( ) {
	var api = apiSwitch();
	var imageLink = items[currentIndex].imgUrl;	
	var artist = items[currentIndex].artist;
	var album = items[currentIndex].album;
	var tracks = items[currentIndex].tracks;

	var author = items[currentIndex].author; 
	var publishedDate = items[currentIndex].published; 

	var slideHTML = "";

	slideHTML += '<button class="close-btn">X</button>';
	slideHTML += '<img src="' + imageLink + '">';	
	slideHTML += '<div class="content">';
	// Show spotify content
	if( api === "spotify" ) {
		slideHTML += '<h1>Artist: ' + artist + '</h1>';
		slideHTML += '<h2>Album: ' + album + '</h2>';
		slideHTML += '<ul class="track-list">';
		$.each( tracks, function(index, item){
			slideHTML += '<li>' + (index+1) + ". " + item.track + '</li>';
		});
		slideHTML += '</ul>';
	// Show flicker content
	} else {
		slideHTML += '<h1>Author: ' + author + '</h1>';
		slideHTML += '<h2>Published Date: ' + publishedDate + '</h2>';
	}
	slideHTML += '</div>'
	$slideContainer.html(slideHTML);
}





/* ============================================================ 
  Click Events
=============================================================== */

/* Note: Use $(document/parent(not dynamically added)).on('click', selector, function(){}) 
   instead of .click() for dynamically created elements. */

// Bind click event to image link
$('#photos').on('click', '.photo a',  function(evt) {
	evt.preventDefault();
	var parent = $(this).parent();
	var listIndex = $('li').index(parent);
	currentIndex = listIndex;

	//update overlay with image link
	$overlay.fadeIn(250);	
	$nextButton.fadeIn(250); 
	$previousButton.fadeIn(250); 
	displaySlide(  );
});

// Close overlay on click button
$(document).on('click', '.close-btn',  function(evt) {
	evt.preventDefault();
	event.stopPropagation();
	$overlay.fadeOut(250);
});

// Next button
$nextButton.click( function(){
	if( currentIndex >= items.length-1 ) {
		currentIndex = items.length-1;
	} else {
		currentIndex++;
	}
	displaySlide();
});

// Previous button
$previousButton.click( function(){
	if( currentIndex <= 0 ) {
		currentIndex = 0
	} else {
		currentIndex--;
	}
	displaySlide();
});










