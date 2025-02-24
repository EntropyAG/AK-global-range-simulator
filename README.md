Arknights Global Range Simulator
================================

<i>Greetings Doktah,

This project should allow you to easily evaluate Lappland alter's skill 3 performance<br/>
in actual combat scenarios. Hopefully this should give you enough information to decide<br/>
whether to put that crazy gal into a locker and stick to sending Goldenglow to the field<br/>
or if the insane wolf girl has her uses.</i>

-Closure

How to get the application
--------------------------

- Download the project by clicking on Code > Download ZIP
- Unzip the file by right clicking on the downloaded file > Extract All
- Go inside the extracted folder until you see "index.html", then open it,
  it should open it using your web browser (Firefox, Chrome, Edge...)

How to use the application
--------------------------

On the left of the screen, you have a menu that allows you to setup the simulation
however you want. Let's go over the options Doktah!
- **Extra drone?** => Lappland sends 3 drones away on skill activation unless her talent Alpha Wolf
enables its last effect. If the checkbox is checked, it will send 4 drones instead!
- **Position X/Y** => Simply move Lappland on which tile you want her to be
- **Flat ATK (inspiration)** => Is here to emulate abilities from Bards, like Sora S2 or Skadi alter S2/S3.
Keep in mind that only 1 bard can buff Lappland at once!
- **ATK % buffs** => Any external buff, if no one else is there to buff Lappland, you can leave it as is! If you have
several buffers, like Warfarin S2M3 (90%) and Aak S3M3 (50%), then simply add up the buffs together! (140%)
- **ASPD buffs** => Same as above, add up any external source of ASPD and you're set!

Alright, your Lappland is in position and has the buffs... Now what?

Now we need to put a bunch of target dummies, so that we can send those adorable puppies to murder them!

Click on the **Add Dummy** button and you will see a new section pop up. Within it, you can set the maximum HP of the dummy.

If you want to add more dummies, you can click **Add Dummy** again or if you don't want to copy the stats/position
again, you can click **Duplicate** on an existing one!

If you happen to create a dummy by accident, you can safely **Delete** them. You can also click on **Deactivate** If
you wish to simply make a dummy invisible for the next simulation, they won't be targeted by the wolves then (no fun!)

Once you're satisfied with the target dummies, you can click on **Start** and watch the massacre! You can also click on **Pause**
to admire the view or take a look at the stats at the bottom of the application (scroll down if you don't see them!)

You can also **Reset** a simulation anytime to take back control, it will restore all dummies' HP back to full and the drones
will be back on Lappland, ready for another round.

There are so many numbers at the bottom, I'm scared! What do they mean?
-----------------------------------------------------------------------

First: don't panic!

The rows are in two major sections:
- The expected values
- The actual values

For the expected values, you can check the spreadsheet available at the link below for all the details, but basically
it represents how much damage should be done in theory agaisnt a single stationary target, with the wolves attacking it
for the full duration of the skill. You can actually try it by placing a single dummy close to Lappland with a lot of HP (1 million
for example) and see the numbers!

The actual values are what you would actually get if you tried to use the skill in the game itself, and they are kind of the whole
point of the simulation. Basically, the 3 rows that will interest us the most are:
- Actual vs expected focused DPS (%)
- Actual vs expected AoE DoT DPS (%)
- Actual vs expected total damage (%)

To understand what they represent, you need to understand that Lappland's S3 has 2 components to it:
- A focused attack, that drones use once they reach a target
- A damage-over-time (DoT) aura that surrounds them at all time, dealing arts damage at most once every second
to each target. It doesn't stack, so even if all wolves are on the same target, said target will only take damage
from the aura once every second.

With this, the "Actual vs expected focused DPS (%)" represents how much damage came from the drones using their attacks when
locked into a target, compared to would be expected in an optimal scenario (fixed, unique target for the whole duration)

The next row "Actual vs expected AoE DoT DPS (%)" is the same, but for the DoT aura.

Finally, "Actual vs expected total damage (%)" is how much damage was actually done compared to what you would expect from the initial
scenario.

If you want to get the full analysis, go to the [spreadsheet](https://docs.google.com/spreadsheets/d/1CdB0e55XNFu5yQu3Xb4MD_3kLEsfGjm_dlwV0H4yLEc) and check the "Lappy S3 travel time" section!

Have fun!
