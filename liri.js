require("dotenv").config();
var keys = require("./keys.js");
var request = require("request");

var args = process.argv;
var command = args[2];
var title = args[3];

if (command === "do-what-it-says") {
    console.log("#1");
    var fs = require("fs");
    var parmsArr = [];
/*    
    fs.readFile("random.txt", "utf8", function(error, parms) {
        console.log("#1.5");
        if (error) {
          console.log(error);
        }
        console.log("parms = " + parms);
        parmsArr = parms.split(",");
        command = parmsArr[0];
        title = parmsArr[1];
        console.log("DWIS:  command = " + command + "    title = " + title);
        cmdMain(command, title);
    });
*/
    var parms = fs.readFileSync("random.txt");
    parms = parms.toString();
    console.log("parms = " + parms);
    parmsArr = parms.split(",");
    command = parmsArr[0];
    title = parmsArr[1];
    console.log("DWIS:  command = " + command + "    title = " + title);
    cmdMain(command, title);
    


}
else cmdMain(command, title);

function cmdMain(command, title) {
    console.log("cmdMain:  command = " + command + "    title = " + title);
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
}

function searchSpotify(command, title) {
    title = title.toString();
    console.log("#3");
    console.log("searchSpotify:  command = " + command + "    title = " + title);
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
        console.log("#4");
        var itemsFound = data.tracks.items.length;
        console.log("Items Found: " + itemsFound);

        console.log("title = " + title.toUpperCase().trim());

        for (var i=0; i<data.tracks.items.length; i++) {
            var item = data.tracks.items[i];
            console.log("item.name = '" + item.name.toUpperCase().trim() + "'");
            if (item.name.toUpperCase().trim() == title.toUpperCase().trim()) {
                songFound = true;
                i = data.tracks.items.length;
                console.log("Song: " + item.name);
                console.log("Artist: " + item.artists[0].name);
                console.log("Album: " + item.album.name);
                if (item.preview_url == null) {
                    console.log("Preview Link not available");
                }
                else {
                    console.log("Preview Link: " + item.preview_url);
                }
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
            tweets.forEach(function(i) {
                console.log(i.created_at + ": " + i.text);
            });
        }
        else {
            console.log("Error occurred: " + error);
        }
    });
}

function searchOMDB(command, title) {
    request("https://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy", function(error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            // Parse the body of the site to recover individual items
            var parsedBody = JSON.parse(body);
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
        }
    });  
}
        
        


