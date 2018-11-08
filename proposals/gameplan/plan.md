# GAME PLAN

## Idea
Refer to [the original proposal](/proposals/realmofthemadgod.md) for the original game idea.

## Story
What's the _story_?

## Prototype
Elements that we want in the prototype:

 - [] Top down sandbox world (camera follows player)
 - [] Level spec: read a level from a textfile (tile based, right)
 - [] Basic objects: solid block (stone, wall, etc.)
 - [] At least 1 boss
 - [] At least 1 small (type of) enemy
 - [] Basic combat gameplay (attack with mouseclick or whatever)
 - [] Basic graphics (go for very simple art or geometric objects in easy distinguishable colors)

Insert your name/handle/username in square brackets if you want to assign yourself to a task.

## Post prototype
Elements that we want in the game, but can skip for the prototype

 - [] Dungeons (entrances and exits to smaller worlds)
 - [] Start screen (loading screen)
 - [] Controls screen (options menu, maybe)
 - [] Game over screen
 - [] Different items (weapons, health, ammo, etc.)
 - [] Graphics!
 - [] Sound
 - [] All those small things and effects that make a game great (screen shake, weapon recoil / flash, damage push back, etc.)

## Awesome to have
Elements that would make this game _killer_!

 - [] Multiplayer
 - [] Better graphics ( ;) )
 - [] Tutorial
 - [] Well balanced gameplay
 - [] Lots of content (5+ bosses to complete, wide array of items, enemies, etc.)
 - [] Auto generated world / dungeons
 - [] Mini map
 - [] Game play story (written or better: small movie with speech and sound effects)
 - [] NPC's (co-op with the computer if multiplayer is too hard)

## Code structure
We should aim for a decent structure for the game, such that it is not a total pain to develop.
Since we are several developers, this is vital if we are to understand the code.

Take a look at @SneManden's game: [Zeus](https://github.com/SneManden/zeus).
It was done somewhat recently and have a nice enough structure that we can build upon.
Very simply put: make sure to develop object oriented.

We will probably need a base character class that can be extended for enemies and players.