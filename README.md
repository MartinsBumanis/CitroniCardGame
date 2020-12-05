# Citroni: The Game

Play the game at [citroni.arcadenexus.com](http://citroni.arcadenexus.com/) or [ej.uz/citroni](http://ej.uz/citroni).

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

To deploy to localhost put "localhost:81" in the GameScene.js websocket variable or IP address for online.

To deploy you can use ''npm start''. 

To install node modules do ''npm install''.

You might need to do ''npm install websockets''