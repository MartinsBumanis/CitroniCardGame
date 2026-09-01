const WebSocket = require("ws");
const Game = require("./Game");

var players = [];
var games = [];

function findGame(name) {
    return games.find((g) => g.name === name);
}

function createGame(name) {
    var game = new Game(name, 4);
    games.push(game);
    console.log("created game", game.name);
    return game;
}

function removeGameIfEmpty(game) {
    if (game.players.length === 0 && games.includes(game)) {
        console.log("removing empty game", game.name);
        games.splice(games.indexOf(game), 1);
    }
}

function leaveGame(player) {
    var game = player.joinedGame;
    if (!game.letLeave(player))
        return false;
    removeGameIfEmpty(game);
    return true;
}

const server = new WebSocket.Server({
    port: 3001
});
server.on("connection", (socket) => {

    if (socket.protocol !== "cards") {
        socket.close(1000, "unsupported protocol");
        return;
    }

    socket.on("close", (code, reason) => {

        var player = players.find((pl) => pl.socket === socket);
        if (player) {
            if (player.joinedGame) {
                console.log("leaving game due to socket close...", player.name);
                leaveGame(player);
            }
        }
    });

    socket.on("message", (message) => {

        var commands = message.split("|");
        console.log("received: %s", commands);

        for (let i = 0; i < commands.length; i++) {
            var command = commands[i].trim();
            if (command.length === 0)
                continue;
            var args = command.split(" ");
            var player = players.find((pl) => pl.socket === socket);

            switch (args[0]) {
                case "gamestate":
                    if (!player || !player.joinedGame) {
                        console.warn("game or player does not exist");
                        continue;
                    }
                    player.joinedGame.setGameState(args[1]);
                    continue;

                case "gamestatevote":
                    if (!player || !player.joinedGame) {
                        console.warn("game or player does not exist");
                        continue;
                    }
                    player.joinedGame.voteSetGameState(args[1]);
                    continue;

                case "setplayer":
                    if (player) {
                        player.name = args[1];
                        continue;
                    }
                    var existingPlayer = players.find((pl) => pl.name == args[1]);
                    if (existingPlayer) {
                        console.log("player overtook lingering socket", existingPlayer.name);
                        existingPlayer.socket.close();
                        existingPlayer.socket = socket;
                        continue;
                    } else {
                        player = {
                            name: args[1],
                            socket: socket,
                            joinedGame: null
                        };
                        players.push(player);
                    }
                    continue;

                case "joinany":
                    if (!player) {
                        console.warn("player does not exist");
                        socket.close(1011, "player doesn't exist");
                        break;
                    }
                    if (player.joinedGame !== null) {
                        console.warn("player already in a game, leaving previous game...", player.name);
                        leaveGame(player);
                    }
                    var game = games.find((g) => !g.inGame() && g.players.length < g.maxPlayers);
                    if (!game) {
                        var gameNumber = 1;
                        while (findGame("game" + gameNumber))
                            gameNumber++;
                        game = createGame("game" + gameNumber);
                    }
                    if (!game.letJoin(player)) {
                        console.warn(player.name, "cannot join", game.name);
                        removeGameIfEmpty(game);
                        socket.close(1011, "cannot join room " + game.name);
                        break;
                    }
                    socket.send("setmaster " + game.players[0].name);
                    continue;

                case "join":
                    var gameName = args[1];
                    if (!player || !gameName || !gameName.match(/^[a-z0-9_-]{1,16}$/i)) {
                        console.warn("invalid game name or player does not exist");
                        socket.close(1011, "invalid game name or player doesn't exist");
                        break;
                    }
                    var game = findGame(gameName);
                    if (game && game.inGame()) {
                        socket.close(1011, game.name + " already started");
                        break;
                    }
                    if (player.joinedGame !== null) {
                        console.warn("player already in a game, leaving previous game...", player.name);
                        leaveGame(player);
                    }
                    if (!game)
                        game = createGame(gameName);
                    if (!game.letJoin(player)) {
                        console.warn(player.name, "cannot join", game.name);
                        removeGameIfEmpty(game);
                        socket.close(1011, "cannot join room " + game.name);
                        break;
                    }
                    socket.send("setmaster " + game.players[0].name);
                    continue;

                case "leave":
                    if (!player || !player.joinedGame) {
                        console.warn("cannot leave nothing");
                        continue;
                    }
                    if (!leaveGame(player)) {
                        console.warn("could not leave");
                    }
                    continue;

                case "close":
                    socket.close();
                    continue;

                case "broadcastall":
                case "broadcast":
                    var includeSender = args[0] === "broadcastall";
                    if (!player || !player.joinedGame) {
                        console.warn("cannot broadcast in nothing");
                        continue;
                    }
                    for (let j = 0; j < player.joinedGame.players.length; j++) {
                        if (includeSender || player.joinedGame.players[j] !== player)
                            player.joinedGame.players[j].socket.send(args.slice(1).join(" "));
                    }
                    continue;

                default:
                    console.error("unknown command", command);
                    continue;
            }
        }

    });

    console.log("connection was made.", socket.protocol);
});

module.exports.getLobbies = () => games.map((game) => ({
    name: game.name,
    playerCount: game.players.length,
    maxPlayers: game.maxPlayers,
    players: game.players.map((pl) => pl.name),
    inGame: game.inGame()
}));