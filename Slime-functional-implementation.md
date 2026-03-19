# Slime — Functional Implementation Document

## 1. Purpose

This document defines the functional vision of **Slime** based on the observed gameplay, room structure, visual language, and level composition of the original reference.

This is **not** a technical architecture document and does **not** prescribe code structure or implementation details. Its purpose is to define, as clearly as possible, how the game should **behave**, **look**, and **feel**.

Primary goal:

- reproduce the gameplay identity of the original puzzle game
- preserve the visual and spatial character of the rooms
- define the slime behavior precisely enough to guide future implementation
- establish a consistent aesthetic and level design direction for the clone

---

## 2. High-Level Game Description

**Slime** is a 2D top-down single-screen puzzle game built around one central mechanic:

- the player controls a green slime
- the slime always starts in a square form
- when the player chooses a direction, the slime slides automatically in that direction until it collides with a wall or obstacle
- the collision changes the slime’s shape and thickness depending on the side that was impacted
- the goal of each room is to find the exact movement sequence needed to modify the slime’s dimensions and orientation so it can reach the exit

The game is not about reflexes, combat, or timing-heavy action. It is about:

- spatial reasoning
- shape manipulation
- route planning
- reading room geometry
- understanding how collisions reshape the slime

Each level is short, readable, and self-contained, but the solution depends on understanding the room layout and the current state of the slime body.

---

## 3. Core Gameplay Identity

The game must preserve the following identity pillars:

### 3.1 Automatic sliding movement

Movement is not step-by-step tile walking.  
Each input causes a full directional slide until the slime is stopped by level geometry or an obstacle.

This creates a puzzle structure based on:

- trajectory commitment
- wall usage
- stopping points
- collision planning

### 3.2 Shape change through impact

The slime is not just moving through the room; it is being reshaped by the room.

The walls are not only barriers. They are the main tools used to modify the slime body.

This is the central idea of the game and must remain the most important mechanic in every design decision.

### 3.3 Puzzle through room geometry

The level is the puzzle.

Rooms are designed so that:

- every important wall has a purpose
- narrow segments matter
- interior structures influence collision order
- the final path depends on reaching a specific body shape

The solution is almost always based on using the architecture correctly, not on interacting with many separate systems.

### 3.4 Single-screen clarity

Each room is shown fully on screen.

This makes the game easy to read and emphasizes puzzle comprehension:
- the entire problem is visible at once
- the player can understand the whole room before acting
- the solution feels geometric and logical

---

## 4. Functional Behavior of the Slime

## 4.1 Initial state

At the start of a room, the slime begins in a **square** or near-square form.

This initial form must read as:
- balanced
- neutral
- stable
- the default body state before any compression happens

Visually, it should feel soft and elastic, but clearly readable.

## 4.2 Movement rule

When the player chooses a direction:

- the slime immediately begins moving in that direction
- it continues automatically without stopping
- it only stops when it hits:
  - a wall
  - a solid obstacle
  - another blocking piece of geometry
  - or any other element intentionally defined as a stopper

The player does not control the slime continuously during the slide.

This means every input is a full commitment.

## 4.3 Reshaping rule

When the slime collides with a surface, its body is altered.

Observed and clarified behavior:

- the slime starts square
- if it hits one side, it becomes flatter on that side and more elongated on the perpendicular axis
- if it hits that same side again, it becomes even thinner in that axis
- if it later hits the opposite side, it regains thickness until it can return to a square state

This means the slime body has memory.

Its form depends on:
- previous collisions
- side of impact
- order of impacts

The room is therefore used to compress and restore the slime strategically.

## 4.4 Orientation and body reading

The slime can become visually:

- square
- slightly compressed
- strongly compressed
- tall and thin
- wide and flat

The exact functional body states may be decided later, but the visual design and gameplay documentation must assume that the slime can occupy multiple thickness states and that this is essential to solving puzzles.

The player must always be able to understand the current body state at a glance.

## 4.5 Emotional expression

The slime is not a purely abstract rectangle.  
It has a face and some visual personality.

From the reference material:
- it appears cute
- expressive
- slightly comedic
- elastic and alive rather than mechanical

The clone should preserve this expressive tone without making it childish or noisy.

The slime should feel:
- soft
- reactive
- readable
- a little funny when stretched or squashed

---

## 5. Functional Goal of Each Room

The objective of a room is not merely “reach the exit”.

The true objective is:

- understand the room
- use the walls to modify the slime
- arrive at the exit with the correct body dimensions and orientation

This means the exit is both:
- a destination
- a final validation of body shape

The room is solved when the slime has been manipulated correctly through movement order and geometry.

---

## 6. Room and Exit Structure

## 6.1 Room format

Each room is:
- single-screen
- enclosed
- top-down
- fully visible at once
- self-contained

Rooms must feel handcrafted.

They should not look procedural, random, or generic.

## 6.2 Exit placement

The exit is embedded into the wall and visually behaves like a dark pipe, drain, or opening.

It is not a glowing portal or a magical marker.

It is an architectural element integrated into the dungeon wall structure.

This is important because it reinforces the grounded dungeon feel.

## 6.3 Exit readability

The exit should be visually distinct but not loud.

It should read as:
- part of the dungeon construction
- clearly interactive
- the final destination
- a shape-sensitive opening

The player should understand intuitively that the slime is meant to fit into it.

---

## 7. Functional Level Design Principles

## 7.1 Levels are geometry puzzles

Levels are built from:
- large open spaces
- thin corridors
- internal walls
- recesses
- protrusions
- bottlenecks
- small interior structures

These are not decorative only.  
They define the solution.

## 7.2 Every wall should matter

The best rooms are not mazes full of random turns.

Instead, they are clean spaces where each wall segment serves one or more purposes:

- redirect motion
- create a stopping point
- compress the slime
- restore width or height
- create a narrow requirement
- block a direct route
- force a specific move order

## 7.3 Single main idea per room

Each room should mostly teach or test one main concept.

Examples:
- how to become thin vertically
- how to recover square shape
- how to use a central pillar to adjust the body
- how to align shape for the exit
- how to use multiple collisions in sequence

This keeps rooms readable and satisfying.

## 7.4 Controlled complexity growth

Difficulty should increase through:
- more constrained geometry
- more required state changes
- less direct line to the exit
- more important collision order
- more room subdivisions
- more deceptive open space

Difficulty should not come mainly from:
- visual clutter
- hidden rules
- excessive object count
- unclear hazards

## 7.5 Open room with surgical constraints

A defining trait of the reference levels is that many rooms are not dense labyrinths.  
They often have a relatively open main area, plus a few carefully placed structures.

This is important.

The rooms feel:
- spacious
- architectural
- deliberate
- readable

The puzzle comes from exact geometry, not maze density.

---

## 8. Observed Style of Room Construction

The screenshots make the room-building style much clearer.

The level aesthetic is based on a **fine visual grid** and a **modular stone dungeon language**.

### 8.1 Fine floor grid

The floor is made of many small stone tiles.

This produces:
- a dense visual rhythm
- a sense of precision
- a stronger feeling that the slime’s dimensions matter
- a handcrafted dungeon surface

The clone should preserve the fine floor rhythm, even if initially simplified.

### 8.2 Thick structural walls

The walls are not flat lines.

They have:
- thickness
- trim
- top surfaces
- corner pieces
- internal and external angle changes
- raised architectural borders

The room outline feels constructed from stone segments, not from abstract collision boxes.

### 8.3 Interior dungeon structures

Rooms often contain:
- central pedestals
- small square or rectangular structures
- recessed wall segments
- isolated stones or rock masses
- narrow channels
- partial barriers that divide space

These features are essential to level design because they create new collision opportunities.

### 8.4 Transitional silhouettes

The room boundaries are often simple overall, but not perfectly rectangular.  
They use:
- cut corners
- alcoves
- wall protrusions
- narrower links between wider sections
- attached side chambers

This gives the levels their dungeon identity.

---

## 9. Aesthetic Direction

## 9.1 Core visual tone

The game should feel like:

- a dark dungeon
- visually clean
- moody but readable
- slightly playful because of the slime
- grounded in stone architecture
- never noisy or overly ornate

It is not:
- cartoon candy style
- bright fantasy overload
- grim horror
- realistic medieval simulation

It lives in a middle zone:
- stylized
- polished
- atmospheric
- readable
- slightly cute because of the protagonist

## 9.2 Color identity

Observed dominant palette:

- black exterior void
- blue-gray / slate dungeon floors
- darker gray stone walls
- warm yellow-orange torch light
- bright green slime and slime residue
- occasional green accents on counters/signs

This creates a strong contrast:
- cold dungeon environment
- warm light pools
- vivid green protagonist

That contrast is one of the most important aesthetic signatures of the game.

## 9.3 Contrast and readability

The visual design is highly readable because:
- the room is framed against black emptiness
- the floor is cool and textured
- the slime is saturated and bright
- the light sources create focal points
- the exit and signs are visually distinct

The clone should prioritize this same readability.

---

## 10. Decorative and Atmospheric Elements

## 10.1 Torches / braziers

The torch-like light sources are important aesthetic anchors.

They provide:
- warmth
- atmosphere
- visual focus
- depth
- a classic dungeon identity

They also make rooms feel inhabited or ancient rather than abstract.

## 10.2 Number signs and room labels

The screenshots show:
- level labels on the left
- number plaques near the exit

These contribute to:
- progression clarity
- the crafted level-by-level structure
- a subtle industrial/dungeon signage language

This should be preserved as part of the room identity.

## 10.3 Slime traces and marks

Green slime residue appears on:
- walls
- floor
- corners
- collision points

These traces are highly characteristic.

They make the room feel:
- active
- physical
- tactile
- marked by the slime’s presence

Functionally they may or may not matter later, but aesthetically they are essential.

## 10.4 Rocks and central props

Some rooms include rock clusters or stone blocks near the center or around openings.

These help:
- break empty space
- create special collision contexts
- reinforce the dungeon theme
- make the room feel spatially authored

---

## 11. Player Readability and Visual Communication

The player should always be able to read:

- where the walls are
- where the exit is
- how narrow a path is
- what shape the slime currently has
- which surfaces are important for collision planning

This means the game must avoid:
- decorative clutter that obscures geometry
- ambiguous wall boundaries
- noisy floor overlays
- effects that hide the silhouette of the slime

The room must remain legible first, atmospheric second.

---

## 12. Functional Role of Space in Puzzle Design

## 12.1 Open space is meaningful

Large empty-looking areas are not wasted.

They matter because they:
- allow long slides
- set up collision direction
- create spatial contrast with narrow sections
- make the player think about approach angle and final body state

## 12.2 Narrow channels are the key tests

The challenge often emerges where the room tightens.

These narrow spaces serve as:
- body checks
- direction checks
- shape validation points
- near-final puzzle gates

## 12.3 Interior structures are tools, not clutter

A pedestal, pillar, rock, or inset wall is valuable because it creates:
- a new stop point
- a shape-adjustment opportunity
- a way to reverse compression
- a route split

Every interior structure should have a job.

---

## 13. Functional Progression of the Campaign

Based on the observed gameplay and room sequence, the campaign should feel like this:

### Early rooms
- teach sliding
- teach that the slime does not stop freely
- teach that collisions matter
- introduce square-to-thin transformation
- use broad, simple spaces

### Early-mid rooms
- introduce more interior walls
- require two or more intentional body adjustments
- begin using narrow passages more aggressively
- create simple body-state planning

### Mid rooms
- create larger spaces with a few carefully placed structures
- force restoration of body shape, not only compression
- make the exit condition more shape-dependent
- require memorizing the current slime state while planning next impacts

### Later rooms
- use compound layouts
- chain multiple body changes in exact order
- use more deceptive room openness
- require long route planning across the full room
- demand a very precise understanding of geometry

The campaign should always feel fair, visible, and understandable, even when difficult.

---

## 14. Desired Room Feel

Every room should feel:

- handcrafted
- deliberate
- spatially elegant
- puzzle-focused
- architecturally coherent
- visually calm
- easy to read
- satisfying to solve

The player should feel:
- “I understand the room”
- “I understand what the walls are doing to me”
- “I know why that solution works”

The solution should feel earned through understanding, not through trial and error alone.

---

## 15. Clone Direction Summary

**Slime** should be a faithful functional reinterpretation of the original game with the following defining qualities:

- single-screen dungeon puzzle rooms
- top-down camera
- square-to-elongated slime deformation as the main mechanic
- automatic sliding until collision
- wall impacts as body-shaping tools
- shape-based exit solving
- fine stone floor grid
- thick modular dungeon walls
- warm torch lighting over cold stone architecture
- vivid green slime with expressive personality
- handcrafted rooms where geometry is the puzzle

This project should preserve the original’s strongest qualities:
- clarity
- tactile geometry
- visual contrast
- elegant room construction
- a mechanic that makes walls feel like puzzle instruments rather than mere boundaries

---

## 16. Final Functional Standard

The game is aligned with the intended direction when:

- the slime behavior is readable and central
- rooms are solved by mastering geometry and shape
- the aesthetic immediately communicates “stone dungeon + green elastic creature”
- each level feels handcrafted and spatially intentional
- the room architecture is visually richer than a basic tile grid
- the player can understand both the challenge and the solution through the room layout itself

If a future implementation drifts toward:
- generic grid puzzling
- plain flat walls
- oversized chunky tiles
- abstract minimalist rooms
- or body changes that feel secondary

then it is moving away from the identity defined in this document.
