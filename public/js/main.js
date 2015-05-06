'use strict';

var isOnSpotify = {
	init: function(settings) {
		// default settings
		isOnSpotify.settings = {
			// debug mode, enable for logging
			debug: false,
			// geoip api endpoint should return
			// an object with a property "country_code"
			// that is a ISO 3166-1 alpha-2 country code
			geoip: 'http://www.telize.com/geoip', 
			// types of things to search Spotify for

			// limit of results for each type
			limit: 8,
			// spotify API base url to perform searches
			spotify: 'https://api.spotify.com/v1/search'
		};

		// allow overriding of default settings if they are passed in init()
		$.extend(isOnSpotify.settings, settings);

		isOnSpotify.setup();
	},
	setup: function() {
		Handlebars.registerHelper('encodeHash', isOnSpotify.encodeHash);
		Handlebars.registerHelper('listGenresPretty', isOnSpotify.listGenresPretty);

		// get ISO 3166-1 alpha-2 country code as country_code
		$.get(isOnSpotify.settings.geoip, function(res) {
			isOnSpotify.countryCode = res.country_code;
			if (isOnSpotify.lastQuery) {
				isOnSpotify.refreshAlerts();
				isOnSpotify.search({ q: isOnSpotify.lastQuery });
			}
		});

		// cache frequently used jquery elements
		isOnSpotify.searchButton = $('#searchButton');
		isOnSpotify.searchBar = $('#searchBar');
		isOnSpotify.tracksDiv = $('#tracksDiv');
		isOnSpotify.albumsDiv = $('#albumsDiv');
		isOnSpotify.artistsDiv = $('#artistsDiv');
		isOnSpotify.alertsDiv = $('#alertsDiv');

		// if the user has a hash in the url, use it as a search term
		if (location.hash) {
			var query = isOnSpotify.decodeHash(location.hash);
			isOnSpotify.search({ q: query });
			isOnSpotify.searchBar.val(query);
		}

		window.onhashchange = function() {
			var query = isOnSpotify.decodeHash(location.hash);
			isOnSpotify.search({ q: query });
			isOnSpotify.searchBar.val(query);
		}

		// register event handlers
		isOnSpotify.searchButton.click(function(e) {
			isOnSpotify.search({ q: isOnSpotify.searchBar.val() });
		});
		isOnSpotify.searchBar.on('keypress', function(e) {
			if (e.which === 13) {
				isOnSpotify.search({ q: isOnSpotify.searchBar.val() })
			}
		});
	},
	listGenresPretty: function(genres) {
		var str;

		str = '';

		genres.forEach(function(val, index) {
			str += (index ? ', ' : '') + val;
		});
		return str;
	},	
	encodeHash: function(str) {
		return encodeURIComponent(str).replace(/%20/g, '+');
	},
	decodeHash: function(str) {
		return decodeURIComponent(str.slice(1).replace(/\+/g, '%20'));
	},
	capitalizeWithHyphen: function(str) {
		str.replace(/-/g, ' ');
		return str.charAt(0).toUpperCase() + str.slice(1);
	},
	playAudio: function(e) {
		var btn = $(this);
		var audio = btn.siblings('audio')[0];
		var glyphicon = btn.find('.glyphicon');

		console.log(btn);
		console.log(audio);
		audio.play();
		glyphicon.removeClass('glyphicon-play').addClass('glyphicon-pause');
		btn.off('click');
		btn.on('click', function() {
			audio.pause();
			glyphicon.removeClass('glyphicon-pause').addClass('glyphicon-play');
			btn.off('click');
			btn.click(isOnSpotify.playAudio);
		});
		$(audio).off('ended');
		$(audio).on('ended', function(e) {
			console.log('ended');
			glyphicon.removeClass('glyphicon-pause').addClass('glyphicon-play');
			btn.off('click');
			btn.click(isOnSpotify.playAudio);
		});
	},
	refreshTracks: function(data) {
		isOnSpotify.tracksDiv.children().remove();

		isOnSpotify.tracksDiv.html(Handlebars.templates.tracks(data));
		$('.track-preview').click(isOnSpotify.playAudio);
		$('#previousTracks').click(function(e) {
			e.preventDefault();
			if (data.tracks.previous) $.get(data.tracks.previous, isOnSpotify.refreshTracks);
		});
		$('#nextTracks').click(function(e) {
			e.preventDefault();
			if (data.tracks.next) $.get(data.tracks.next, isOnSpotify.refreshTracks);
		});
	},
	refreshAlbums: function(data) {
		isOnSpotify.albumsDiv.children().remove();

		isOnSpotify.albumsDiv.html(Handlebars.templates.albums(data));
		
		$('#previousAlbums').click(function(e) {
			e.preventDefault();
			if (data.albums.previous) $.get(data.albums.previous, isOnSpotify.refreshAlbums);
		});
		$('#nextAlbums').click(function(e) {
			e.preventDefault();
			if (data.albums.next) $.get(data.albums.next, isOnSpotify.refreshAlbums);
		});
	},
	refreshArtists: function(data) {
		isOnSpotify.artistsDiv.children().remove();

		isOnSpotify.artistsDiv.html(Handlebars.templates.artists(data));
		$('#previousArtists').click(function(e) {
			e.preventDefault();
			if (data.artists.previous) $.get(data.artists.previous, isOnSpotify.refreshArtists);
		});
		$('#nextArtists').click(function(e) {
			e.preventDefault();
			if (data.artists.next) $.get(data.artists.next, isOnSpotify.refreshArtists);
		});
	},
	refreshResults: function(data) {
		['Tracks', 'Albums', 'Artists'].forEach(function(x) {
			isOnSpotify['refresh' + x](data);
		});
	},
	refreshAlerts: function() {
		var obj = {
			code: isOnSpotify.countryCode
		}
		if (isOnSpotify.countryCode) obj.cssCode = isOnSpotify.countryCode.toLowerCase();
		isOnSpotify.alertsDiv.html(Handlebars.templates.country(obj));
	},
	search: function(options) {
		isOnSpotify.lastQuery = options.q;
		isOnSpotify.refreshAlerts();

		if (options.q === '') {
			isOnSpotify.refreshResults({
				tracks: {

				},
				albums: {

				},
				artists: {

				}
			});
			location.hash = '';
			return;
		}
		// see https://developer.spotify.com/web-api/search-item/
		var queryParams = {
			type: 'track,album,artist',
			limit: isOnSpotify.settings.limit
		}

		if (isOnSpotify.countryCode) queryParams.market = isOnSpotify.countryCode;

		$.extend(queryParams, options);

		$.get(isOnSpotify.settings.spotify, queryParams, function(res) {
			if (isOnSpotify.settings.debug) console.log(res);
			location.hash = isOnSpotify.encodeHash(options.q);
			isOnSpotify.refreshResults(res);
		});
	}
}

$(document).ready(isOnSpotify.init({ debug: false }));