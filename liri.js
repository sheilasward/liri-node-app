require("dotenv").config();
var keys = require("./keys.js");
var request = require("request");

var args = process.argv;
var command = args[2];
var title = args[3];
cmdMain(command, title);


function cmdMain(command, title) {
    if (command == "spotify-this-song") {
        searchSpotify(command, title);
    }
    else if (command === "my-tweets") {
        var nbrTweets = 20;
        getTweets(nbrTweets);
    }
    else if (command === "movie-this") {
        searchOMDB(command, title);
    }
    else if (command === "do-what-it-says") {
        var parms = doIt();
    }
}

function doIt() {
    var fs = require("fs");
    fs.readFile("./random.txt", "utf8", function(error, parms) {
        if (error) {
          console.log(error);
        }
        var parmsArr = [];
        parmsArr = parms.split(",");
        command = parmsArr[0];
        title = parmsArr[1];
        cmdMain(command, title);
    });
}

function searchSpotify(command, title) {
    var Spotify = require("node-spotify-api");
    var spotify = new Spotify(
        {
            id:process.env.SPOTIFY_ID, 
            secret:process.env.SPOTIFY_SECRET
        });
    spotify.search({
        type: 'track',
        query: title
    },
    function(err, data) {
        if(err) {
            console.log("Error occurred: " + err);
        }
        var songFound = false;
        var itemsFound = data.tracks.items.length;
        for (var i=0; i<itemsFound; i++) {
            var item = data.tracks.items[i];
            if (item.name.toUpperCase().trim() === title.toUpperCase().trim()) {
                songFound = true;
                i = data.tracks.items.length;
                console.log("---------------------------------------------------");
                console.log("Song: " + item.name);
                console.log("Artist: " + item.artists[0].name);
                console.log("Album: " + item.album.name);
                if (item.preview_url === null) {
                    console.log("Preview Link not available");
                }
                else {
                    console.log("Preview Link: " + item.preview_url);
                }
                console.log("---------------------------------------------------");
            }
        }
        if (!songFound) {
            console.log();
            console.log("Requested song was not found.");
            console.log("Default Song will be printed...");
            console.log();
            title = "The Sign";
            searchSpotify(command, title);
        }
    });

}

function getTweets(nbrTweets) {
    var Twitter = require("twitter");
    var twitter = new Twitter(
        {
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        });

    twitter.get('statuses/user_timeline', {screen_name: 'Dwitter89422817'}, function (error, tweets, response) {
        if (!error && response.statusCode === 200) {
            console.log("---------------------------------------------------");
            tweets.forEach(function(i) {
                console.log(i.created_at + ": " + i.text);
            });
            console.log("---------------------------------------------------");
        }
        else {
            console.log("Error occurred: " + error);
        }
    });
}

function searchOMDB(command, title) {
    request("https://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy", function(error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (error) {
            console.log("Error occurred: " + err);
        }
        console.log("Response Code: " + response.statusCode);
        if (!error && response.statusCode === 200) {
            // Parse the body of the site to recover individual items
            var parsedBody = JSON.parse(body);
            console.log("---------------------------------------------------");
            console.log("Title of the movie: " + parsedBody.Title);
            console.log("Year of movie: " + parsedBody.Year);
            console.log("IMDB rating is: " + parsedBody.imdbRating);
            for (var i=0; i<parsedBody.Ratings.length; i++) {
                if (parsedBody.Ratings[i].Source === "Rotten Tomatoes") { 
                    console.log("Rotten Tomatoes rating is: " + parsedBody.Ratings[i].Value);   
                }
            }
            console.log("Movie was produced in: " + parsedBody.Country);
            console.log("Movie Language: " + parsedBody.Language);
            console.log("Movie Plot: " + parsedBody.Plot);
            console.log("Movie Actors: " + parsedBody.Actors);
            console.log("---------------------------------------------------");
        }
    });  
}
        
        


