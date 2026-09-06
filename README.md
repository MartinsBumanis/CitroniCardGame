# Citroni: The Game

Play the game at [Citroni.lv](http://Citroni.lv) or [ej.uz/citroni](http://ej.uz/citroni).

## Rules
This is a variation of the game Sh*thead, from the computer science students of RTU. Original rules:  [wikipedia](https://en.wikipedia.org/wiki/Shithead_(card_game)).

Special cards:

* 3 - starts from beginning

* 6 - transparent, keeps the value from last card

* 10 - burn the stack

* Joker - burn the stack

* 4 of the same burns the stack.

Original code from [CodeStix](https://github.com/CodeStix/shithead-the-game).

The current state of the game requires a HTTP connection, won't work with HTTPS.

When opened via localhost the game connects to ws://localhost:3001 automatically; for online deploys put your server IP/domain in the GameScene.js websocket variable.

Lobbies: the start page lists all open lobbies (name, players, status) with join buttons, refreshed every 3 seconds via GET /lobbies. Create a named lobby from the form, or use Quick play to join any open lobby. Empty lobbies are removed automatically.

To deploy you can use ''npm start''. 

To install node modules do ''npm install''.

You might need to do ''npm install websockets''
