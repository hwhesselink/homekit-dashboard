# Homekit Dashboard

Generate Home Assistant dashboards that behave like the Apple Home app.
Mainly focused on the Home Assistant Companion app but the dashboards also work in browsers.

Homekit Dashboard makes extensive use of Home Assistant areas and labels ("on_home_view", "favorite", "in_summaries") and other settings.
Areas drive dashboard creation, only entities assigned to an area are included in the views.
Labels determine what entities are included on the home page and in badges.
Adding entities is described in [Populating the dashboard](#populating-the-dashboard) below.

![combi view](docs/combi.jpg)

<details>
  <summary>More screens</summary>

  ![combi view 2](docs/combi2.jpg)
</details>

## Configuring Homekit Dashboard

The installation file goes into detail but tl;dr to get a bare dashboard up and running (note: to use the buttons you must have [HACS][hacsInstallUrl] installed):

1. Install dependencies:

- [Mushroom Cards][mushroomCards]

  [![Open in HACS at your Home Assistant instance.][hacsBadge]][mushroomCardsHacs]

- [card-mod][cardMod]

  [![Open in HACS at your Home Assistant instance.][hacsBadge]][cardModHacs]

and optionally:

- [Kiosk Mode][kioskmode]

  [![Open in HACS at your Home Assistant instance.][hacsBadge]][kioskModeHacs]

2. Install Homekit Dashboard

- [Homekit Dashboard][repositoryUrl]

  [![Open in HACS at your Home Assistant instance.][hacsBadge]][homekitDashboardHacs]

3. Go to `Settings->Dashboards`, click on _ADD DASHBOARD_ and create an empty dashboard

4. In the popup fill in the Title, leave the rest as-is and click _CREATE_

5. Click the _OPEN_ button on the newly-created entry in the Dashboards list
6. Click the pen icon at the top-right corner of the dashboard
7. Click the 3 vertical dots at the top-right corner of the dashboard and select _Raw configuration editor_ from the dropdown
8. Replace the text that appears with:
   ```yaml
   type: custom:homekit-dashboard
   views: []
   ```
   
   then click _SAVE_ and then the _X_ at the top left corner of the editor window to close it
9. Click the _DONE_ button at the top right

You now have an empty home page "My Home" and no badges, [Populating the dashboard](#populating-the-dashboard) below explains how to add entities by assigning labels.

If you already have entities assigned to areas they they should show up in one of the other (non-Home) views, otherwise those views will also be empty.

The new dashboard should also be available in the Companion App.
If it does not show up you may have to clear the frontend cache (on the device) by going to `Settings->Companion app->Debugging` and clicking _Reset the frontend cache_.

### Dashboard name
You can change the title of the home page (_My Home_ by default) by changing the dashboard config (see steps 6-9 above) and adding a _home_name_ config entry:
   ```yaml
   type: custom:homekit-dashboard
   views: []
   config:
     home_name: My Cool Dashbooard

   ```

# Populating the dashboard
All entities to appear in a dashboard need to have an area assigned.
It's not necessary to do an assignment for every entity:
if a device is assigned an area all its entities are also assigned to that area (this can be overridden per entity).

Area assignment can be done piece-meal or in bulk but only needs to be done once.
Home Assistant supports easy bulk assigning.

## Areas
Areas can really simplify automations, etc. so are a good idea in general, but Homekit Dashboard won't work at all without them.
For my personal home system I make every room an area, plus garage, front porch, garden and a generic "outside".

Create areas by going to Settings->Areas, labels & zones->Areas tab and clicking "CREATE AREA".
Give the area a name and fill in any other desired fields, Homekit Dashboard currently only uses the name and the background picture.
Once created clicking on the pen icon allows specifying related temperature and humidity sensors but these are currently also not used.

If relevant it can also be useful to add floors ("CREATE FLOOR" on the same page).
This allows for e.g. "Turn off all downstairs lights".

## Labels
Homekit Dashboard needs 3 labels:
- on_home_view
- favorite
- in_summaries

Go to the Settings->Areas, labels & zones->Labels tab and create them.
Only the name is used, make sure it is exactly as given here.

Labels work the same way as in Apple Home: setting the "on_home_view" label on an entity will place it on the app home page;
setting "favorite" will place it in the "Favorites" section on the home page (independent of "on_home_view");
the "in_summaries" label will include the entity in the badge count for that kind of entity if it is "on" in some sense (counts are filtered by area in area views).
The "on_home_view" and "favorite" labels only influence whether and how an entity appears on the home page.
The "in_summaries" label only influences how/if badges are shown.

## Configuring entities
The following is a fairly efficient way to bulk-configure the dashboard entities.

### Devices
To assign devices (and all their entities) to areas:

1. Go to "Settings->Devices & services->Devices tab"
2. Click on "Filters/Integrations"
3. Select only the Integrations that have devices of interest (in my case that narrows the list down by 75%)
4. Click on the "Enter selection mode" button to the left of the search bar
5. Select all the devices that are in 1 particular area
6. Click on "Move to area" and select that area
7. rinse, repeat for the other areas

### Entities
Entities that don't inherit an area from a device, or where the area is different from the device, not to be set separately:

1. Go to "Settings->Devices & services->Entities tab"
2. Click on "Filters/Domains"
3. Select a domain, e.g. "Lights"
4. Click on the "Enter selection mode" button to the left of the search bar
5. Select all entities that you want to have a particular label
6. Click on "Add label" and select that label (and others if relevant)
7. rinse, repeat

These domains may have relevant entities:

- Alarm control panel
- Binary sensor
- Climate
- Cover
- Fan
- Light
- Lock
- Media player
- Sensor
- Switch
- Vacuum

Going through long lists of entities item by item to decide what to select is no fun, so it helps to use filters and column sorting to group them.
For example for lights you might select domain "Lights", sort on "Integration", and add the "in_summaries" label to all lights that do not have integration "Group".

Entities will appear in the dashboard as they are assigned to areas and get labels.

### Hiding an entity
Sometimes an entity will be put on the dashboard that's not wanted.
For instance a templated fan might show up twice: once for the actual fan and once for the template.
Turning off "Visible" in the entity settings for the actual fan will prevent it from appearing on the dashboard.

[hacsBadge]: https://my.home-assistant.io/badges/hacs_repository.svg

[releaseBadge]: https://img.shields.io/github/v/tag/digilive/mushroom-strategy?filter=v2.3.2&label=Release

[sponsorBadge]: https://img.shields.io/badge/Sponsor_him-%E2%9D%A4-%23db61a2.svg?&logo=github&color=%23fe8e86

<!-- Repository References -->

[repositoryUrl]: https://github.com/hwhesselink/homekit-dashboard
[issuesUrl]: https://github.com/hwhesselink/homekit-dashboard/issues
[discussionsUrl]: https://github.com/hwhesselink/homekit-dashboard/discussions
[wikiUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki
[installationUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki#installation
[homekitDashboardHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=hwhesselink&repository=homekit-dashboard&category=plugin

[mushroomCards]: https://github.com/piitaya/lovelace-mushroom
[mushroomCardsHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=piitaya&repository=lovelace-mushroom
[cardMod]: https://github.com/thomasloven/lovelace-card-mod
[cardModHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=thomasloven&repository=lovelace-card-mod
[kioskMode]: https://github.com/NemesisRE/kiosk-mode
[kioskModeHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=NemesisRE&repository=kiosk-mode

<!-- Other References -->

[hacsUrl]: https://hacs.xyz
[hacsInstallUrl]: https://www.hacs.xyz/docs/use

[miniGraphUrl]: https://github.com/kalkih/mini-graph-card
