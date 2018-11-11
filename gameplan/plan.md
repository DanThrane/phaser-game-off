# GAME PLAN

## Idea

Refer to [the original proposal](/proposals/realmofthemadgod.md) for the
original game idea.

## Story

What's the _story_?

Story ideas (actually more like plot ideas but whatever):

 - (Fantasy) The Thousand Year (evil) king returns from his long slumber to
   take over the world with his demon (or undead) armies
 - (Post-apocalyptic (possibly)) An odyssey tale about your tribe, stricken by
   horrible mutations from their expose to the waste that seemed totally ok to
   settle in at first, desperate attempt to get to a promised land (e.g. a land
   were they wouldn't die out)
 - (Sci-fi) A rouge advanced AI has taken over a robot production facility
   and you, and your group, the Special AI Containment Unit, is sent in to deal
   with the AI's mischief
 

## Prototype
Elements that we want in the prototype:

 - [X] Top down sandbox world (camera follows player) (Already done in
   current code. Otherwise `this.cameras.main.startFollow(player, true);`)
 - [X] Level spec: read a level from a text file (tile based, right)
 - [ ] Basic objects: solid block (stone, wall, etc.) (Wall done)
 - [ ] At least 1 boss
 - [Anders] At least 1 small (type of) enemy
 - [ ] Basic combat gameplay (attack with mouse click or whatever)
 - [ ] Basic graphics (go for very simple art or geometric objects in easy
   distinguishable colors)
 - [ ] Hybrid-gameplay (2 slots for abilities, can be swapped (or assigned if
   starting with none) when defeating a boss (ability defined by boss))
 
Insert your name/handle/username in square brackets if you want to assign
yourself to a task.

## Post prototype

Elements that we want in the game, but can skip for the prototype

 - [ ] Dungeons (entrances and exits to smaller worlds)
 - [ ] Start screen (loading screen)
 - [ ] Controls screen (options menu, maybe)
 - [ ] Game over screen
 - [ ] Different items (weapons, health, ammo, etc.)
 - [ ] Graphics!
 - [ ] Sound
 - [ ] All those small things and effects that make a game great (screen 
   shake, weapon recoil / flash, damage push back, etc.)

## Awesome to have

Elements that would make this game _killer_!

 - [ ] Multiplayer
 - [ ] Better graphics ( ;) )
 - [ ] Tutorial
 - [ ] Well balanced gameplay
 - [ ] Lots of content (5+ bosses to complete, wide array of items, enemies, 
   etc.)
 - [ ] Auto generated world / dungeons
 - [ ] Mini map
 - [ ] Game play story (written or better: small movie with speech and sound 
   effects)
 - [ ] NPC's (co-op with the computer if multiplayer is too hard)

## Code structure

We should aim for a decent structure for the game, such that it is not a
total pain to develop. Since we are several developers, this is vital if we
are to understand the code.

Take a look at @SneManden's game: [Zeus](https://github.com/SneManden/zeus).
It was done somewhat recently and have a nice enough structure that we can
build upon. Very simply put: make sure to develop object oriented.

We will probably need a base character class that can be extended for enemies
and players.
