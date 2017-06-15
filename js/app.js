
/* ============================================================ 
  Global Variables
=============================================================== */

var $overlay = $('<div id="overlay"></div>');
var $slideContainer = $('<div id="slide-container" class="clearfix">');
var $previousButton = $('.previous-btn');
var $nextButton = $('.next-btn');

// Append element
$overlay.append($previousButton);
$overlay.append($nextButton);
$overlay.append($slideContainer);
$("body").append($overlay);

// Hide element
$overlay.hide();
$nextButton.hide();
$previousButton.hide();

var items = [];
var currentIndex = 0;



/* ============================================================ 
  Connect to api / retrieve data
=============================================================== */

// Get api option from switch button
function apiSwitch() {
  if( document.querySelector("#api-option").value === "openlibrary" ) {
    return "openlibrary";
  } else {
    return "flicker";
  }
}

// Form submittion
$('form').submit( function ( evt ) {
	evt.preventDefault();
	var api = apiSwitch();
	var $searchField = $('#search');
	var query = $searchField.val();

	// Spotify api
	var openlibraryAPI = 'https://openlibrary.org/search.json?';
	var openlibraryOptions = {
	   q : query
	};
	// Flicker api
	var flickrAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
	var flickrOptions = {
		tags: query,
		format: "json"
	};

	if( api === "openlibrary" ) {
		getApi(openlibraryAPI, openlibraryOptions, getOpenlibraryItems);
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

// Get openLibrary items
function getOpenlibraryItems( data ) {
	// Clear previous search items
	items = [];
    $.each( data.docs, function( index, item ) {
      	var itemObj = {

      		bookAuthor: getFirstIndex(item.author_name),
  			title: item.title,
  			firstPublished: item.first_publish_year,
  			openlibraryId: item.cover_edition_key,
  			openlibraryLink: "https://openlibrary.org" + item.key,
  			ebookCount: item.ebook_count_i,
  			editionCount: item.edition_count,
  			imgUrl: "http://covers.openlibrary.org/w/id/" +  item.cover_i + "-M.jpg"
      	};   

     	items.push(itemObj);
    }); // end each     

    function getFirstIndex(item) {
    	return $(item).get(0);
    }	
    displayGallery();
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
	if ( api === "openlibrary" ) {
		$('.sort-opt1').text('Author');
		$('.sort-opt2').text('Published Date');
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
		if ( api === "openlibrary" ) {
		    var bookAuthorA = a.bookAuthor, 
		    	bookAuthorB = b.bookAuthor;
		    if (bookAuthorA < bookAuthorB) //sort string ascending
		        return -1; 
		    if (bookAuthorA > bookAuthorB) //sort string descending
		        return 1; 
		    return 0; //default return value (no sorting)
		} else {
			var authorA = a.author.toLowerCase(), 
				authorB = b.author.toLowerCase();
			if (authorA < authorB) 
			    return -1; 
			if (authorA > authorB)
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
		if ( api === "openlibrary" ) {
			var nameA = a.firstPublished,  
		    	nameB = b.firstPublished;
		    if (nameA < nameB) 
		        return -1; 
		    if (nameA > nameB) 
		        return 1; 
		    return 0;
		} else {
			// Convert date to milliseconds
			var dateA = Date.parse(a.published), 
			 	dateB = Date.parse(b.published);
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
	var api = apiSwitch();
	var itemHTML = '';
	
	if (items.length > 0 ) {
		$.each( items, function( index, item ) {
		   var imageUrl = item.imgUrl;
		   var title = item.title;
		   itemHTML += '<li class="photo">';
		   // Display title if no photo available
		   if ( imageUrl.indexOf("undefined") !== -1 ){
		   		itemHTML += '<a href="' + imageUrl + '">';
		   		itemHTML += "<div class ='undefined-photo'>";	 
		   		itemHTML += "<p>Title</p>";
		   		itemHTML += "<h2>" + title + "</h2>";
		   		itemHTML += "</div></a></li>";
		   } else {
			   itemHTML += '<a href="' + imageUrl + '">';
			   itemHTML += '<img src="' + imageUrl + ' "></a></li>'; 
		   } 
		}); // end each

	} else {
		itemHTML = 'No photos found that match';
	}
	$('#photos').html(itemHTML);
}


// Show slide
function displaySlide() {
	var api = apiSwitch();
	var imageLink = items[currentIndex].imgUrl;	
	// Openlibrary items
	var title = items[currentIndex].title;
	var bookAuthor = items[currentIndex].bookAuthor;
	var firstPublished = items[currentIndex].firstPublished;
	var openlibraryId = items[currentIndex].openlibraryId;
	var editionCount = items[currentIndex].editionCount;
	var ebookCount = items[currentIndex].ebookCount;
	var openlibraryLink = items[currentIndex].openlibraryLink;
	// Flicker items
	var author = items[currentIndex].author; 
	var publishedDate = items[currentIndex].published; 

	var slideHTML = "";

	slideHTML += '<button class="close-btn">X</button>';
	// Display text if no photo available
	if ( imageLink.indexOf("undefined") !== -1 ){
		slideHTML += '<div class="undefined-photo-overlay">No Photo</div>';
	} else {
		slideHTML += '<img src="' + imageLink + '">';	
	}
	slideHTML += '<div class="content">';

	// Show spotify content
	if( api === "openlibrary" ) {
		slideHTML += '<h1>' + title + '</h1>';
		slideHTML += '<h2>by ' + bookAuthor + '</h2>';
		slideHTML += '<h4>First Published in ' + firstPublished + '</h4>';

		slideHTML += '<div id="book-info">';
		slideHTML += '<ul class="track-list">';
		// slideHTML += '<h2>ID Numbers</h2>';
		slideHTML += '<li>Open Library ID: ' + openlibraryId + '<li>';
		slideHTML += '<li>Editions: ' + editionCount + '<li>';
		slideHTML += '<li>Ebook: ' + ebookCount + '<li>';
		slideHTML += '</ul>';
		slideHTML += '<a class="book-link" href="' + openlibraryLink + '"> More Info</a>';
		slideHTML += '</div>';

	// Show flicker content
	} else {
		slideHTML += '<h1>Author: ' + author + '</h1>';
		slideHTML += '<h2>Published Date: ' + publishedDate + '</h2>';
	}
	slideHTML += '</div>';
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
		currentIndex = 0;
	} else {
		currentIndex--;
	}
	displaySlide();
});
