var axios = require('axios');
var id;
var sec;
var params;

function getProfile (username) {
    //Send this request
    return axios.get('https://api.github.com/users/' + username + params)
        //When we get it back, do the following function
        .then(function(user){
            return user.data;
        })
}

function getRepos (username) {
    return axios.get('https://api.github.com/users/' + username + '/repos' + params + '&per_page=100')
}

function getStarCount (repos) {
    return repos.data.reduce(function(count, repo) {
        return count + repo.startgazers_count;
    }, 0);
}

function calculateScore (profile, repos) {
    var followers = profile.followers;
    var totalStarts = getStarCount(repos);

    return (followers * 3) + totalStars;
}

function handleError (error) {
    console.warn(error);
    return null;
}

function getUserData (player) {
    //takes in array of promises
    return axios.all([
        getProfile(player),
        getRepos(player)
    ]).then(function(data){
        var profile = data[0];
        var repos = data[1];

        return{
            profile: profile,
            score: calculateScore(profile,repos)
        }
    })
}
function sortPlayers (players) {
    return players.sort(function (a,b) {
        return b.score - a.score;
    })
}
module.exports = {
    battle: function (players) {
       //(players.map(getUserData) returns the array that getUserData gets us for all players
       //Each item in the array is a promise
       //Once all promises resolve then we'll sort them 
        return axios.all(players.map(getUserData))
            .then(sortPlayers)
            .catch(handleError)
    },
    fetchPopularRepos: function (language) {
        var encodedURI = window.encodeURI('https://api.github.com/search/repositories?q=stars:>1+language:'+ language + '&sort=stars&order=desc&type=Repositories');

        return axios.get(encodedURI)
            .then(function (response) {
                return response.data.items;
            })
    }
}