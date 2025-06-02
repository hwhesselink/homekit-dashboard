# Homekit Dashboard

Generate Home Assistant dashboards that behave like the Apple Home app.
Mainly focused on the Home Assistant Companion app but the dashboards also work in browsers.

Homekit Dashboard makes extensive use of Home Assistant areas and labels ("On Home View", "Favorite", "In Summaries") and other settings.
Areas drive dashboard creation, only entities assigned to an area are included in the dashboard.
Labels determine what entities are included on the home page and in badges.
Adding entities is described in [Populating the dashboard](#populating-the-dashboard) below.

![combi view](docs/combi.jpg)

<details>
  <summary>More screens</summary>

  ![combi view 2](docs/combi2.jpg)
</details>

# Configuring Homekit Dashboard

The [installation file][installationUrl] goes into detail, including how to install without HACS, but tl;dr to get a bare dashboard up and running if you have [HACS][hacsInstallUrl] installed:

1. Install dependencies:
    - _Mushroom Cards_

    [![Open in HACS at your Home Assistant instance.][hacsBadge]][mushroomCardsHacs]

    - _Card Mod 3_
  
    [![Open in HACS at your Home Assistant instance.][hacsBadge]][cardModHacs]

    - and optionally _Kiosk Mode_ (Note: check [here][kioskModeVersion] for version compatibility depending on whether you're running Home Assistant 2025.5.0 or earlier)
  
    [![Open in HACS at your Home Assistant instance.][hacsBadge]][kioskModeHacs]

1. Install Homekit Dashboard

    [![Open in HACS at your Home Assistant instance.][hacsBadge]][homekitDashboardHacs]

1. Restart Home Assistant: go to `Settings`, click the 3 vertical dots at the top-right corner and select _Restart Home Assistant_ from the drop-down, click _Restart Home Assistant_ and then _RESTART_

1. Go to `Settings->Dashboards`, click on _ADD DASHBOARD_ and create an empty dashboard

1. In the popup fill in the Title, leave the rest as-is and click _CREATE_

1. Click the _OPEN_ button on the newly-created entry in the Dashboards list

1. Click the pen icon at the top-right corner of the dashboard

1. Click the 3 vertical dots at the top-right corner of the dashboard and select _Raw configuration editor_ from the dropdown

1. Replace the text that appears with:
   ```yaml
   strategy:
     type: custom:homekit-dashboard
     views: []
   ```
   
   then click _SAVE_ and then the _X_ at the top left corner of the editor window to close it (you may have to click the _X_ twice)

10. Click the _DONE_ button at the top right

You now have an empty home page "My Home" and no badges.
[Populating the dashboard](#populating-the-dashboard) below explains how to add entities by assigning areas and labels.
The [configuration file][configurationUrl] explains how to change the home page name, default background and other settings.

If you already have entities assigned to areas they should show up in one of the other (non-Home) views, otherwise those views will also be empty.

The new dashboard should show up in the Companion App.
If it doesn't you may have to clear the frontend cache (on the device) by going to `Settings->Companion app->Debugging` and clicking _Reset the frontend cache_.

NOTE: by default the sidebar and overflow button are hidden on mobile devices so if you're installing via a mobile device, once you open the dashboard there will be no way to exit.
See the [configuration file][configurationUrl] for how to override this _before_ installing via a mobile device.

# Populating the dashboard
Only entities assigned to an area will appear in the dashboard.
It's not necessary to assign every entity:
if a device is assigned to an area all its entities are also assigned to that area (this can be overridden per entity).

Area and label assignment can be done piece-meal or in bulk but only needs to be done once.
Home Assistant supports easy bulk assigning except for assigning entities to areas.

## Areas
Areas can really simplify automations, etc. and are a good idea in general, but Homekit Dashboard won't work at all without them.
For my personal home system I make every room an area, plus garage, front porch, garden and a generic "outside".

Create areas by going to `Settings->Areas, labels & zones`, selecting the `Areas` tab and clicking _CREATE AREA_.
Give the area a name and fill in any other desired fields, Homekit Dashboard currently only uses the name and the (optional) background picture.
Once created clicking on the pen icon allows specifying related temperature and humidity sensors but these are currently also not used.

If relevant it can also be useful to add floors (_CREATE FLOOR_ on the same page).
This allows for e.g. "Turn off all downstairs lights".

## Labels
Homekit Dashboard needs 3 labels:
- `On Home View`
- `Favorite`
- `In Summaries`

Go to `Settings->Areas, labels & zones`, select the `Labels` tab and create them.
Only the name is used, make sure it is exactly as given here.

Labels work the same way as in Apple Home: setting the _On Home View_ label on an entity will place it on the app home page;
setting _Favorite_ will place it in the _Favorites_ section on the home page (independent of _On Home View_);
the _In Summaries_ label will include the entity in the home and view pages badge count for that kind of entity if it is "on" in some sense.

The _On Home View_ and _Favorite_ labels only influence whether and how an entity appears on the home page.
The _In Summaries_ label only influences how/if badges are shown on the home and view pages.
Badges on area pages show summaries for the sensors in that area.

## Assigning areas and labels
It can be a lot of work to assign areas and labels if starting from scratch.
The following procedure tries to minimize that:

### Devices
Assign devices (and all their entities) to areas:

1. Go to `Settings->Devices & services` and select the `Devices` tab
1. Click on _Filters_ then _Integrations_
1. Select only the Integrations that have devices of interest (in my case that narrows the list down by around 75%)
1. Click on the _Enter selection mode_ button to the left of the search bar
1. Select all the devices that are in 1 particular area
1. Click on _Move to area_ and select that area
1. Rinse, repeat for the other areas

Devices can have labels assigned to them but these are not used by Homekit Dashboard.

### Entities
#### Areas
Entities that don't inherit an area from a device, or where the area is different from the device, need to be set separately.
At the moment Home Assistant does not have an option to do this in bulk so this is the process I use:

1. Go to `Settings->Devices & services` and select the `Entities` tab
1. In the `Group by` dropdown to the right of the search bar select _Area_
1. In the same dropdown select _Collapse all_
1. In the _Entitiy_ column scroll down to _Ungrouped_ and click on it to show only entities without an area
1. Click on _Filters_ then _Integrations_ and make the same selection as for _Devices_ above
1. Click on the _Enter selection mode_ button to the left of the search bar
1. In the entities list select each entity you want to show in the dashboard and click the `Settings` cog at the top of the pop-up
    - if there is an _Area_ dropdown select an area there
    - if there isn't, turn off the _Use device area_ toggle and select an area in the _Area_ dropdown that appears
1. Click _UPDATE_ at bottom right
1. Rinse, repeat

Selecting one or a few domains at a time from the _Domain_ list in the _Filters_ section can make it easier to deal with a long entities list.

#### Labels
Assign labels to entities:

1. Go to `Settings->Devices & services` and select the `Entities` tab
1. Click on _Filters_ then _Area_
1. Select all areas, this will limit the entities list to entities that can appear on the dashboard
1. Under _Filters_ click on _Integrations_ and make the same selection as for _Devices_ above
1. Click on the _Enter selection mode_ button to the left of the search bar
1. Select all entities that you want to show on the home page
1. From the _Add label_ dropdown (top right) select _On Home View_
1. Click once or twice on the "select all" button between the search bar and the entity list to clear all selections
1. Select all entities that you want to be included in the summary badges
1. From the _Add label_ dropdown select _In Summaries_
1. _Favorites_ can be added in the same way but it's likely to be easier via the dashboard itself: in the browser or on your mobile device long-click the entity, select the _settings_ cog and select _Favorite_ in the `Add label` field and then click _UPDATE_

Entities will appear in the dashboard as they are assigned to areas and given labels.

## Hiding entities
Sometimes an entity will be put on the dashboard that's not wanted.
For instance a templated fan might show up twice: once for the actual fan and once for the template.
Turning off _Visible_ in the entity settings for the actual fan will prevent it from appearing on the dashboard.

[hacsBadge]: https://my.home-assistant.io/badges/hacs_repository.svg

[releaseBadge]: https://img.shields.io/github/v/tag/digilive/mushroom-strategy?filter=v2.3.2&label=Release

[sponsorBadge]: https://img.shields.io/badge/Sponsor_him-%E2%9D%A4-%23db61a2.svg?&logo=github&color=%23fe8e86

<!-- Repository References -->

[repositoryUrl]: https://github.com/hwhesselink/homekit-dashboard
[issuesUrl]: https://github.com/hwhesselink/homekit-dashboard/issues
[discussionsUrl]: https://github.com/hwhesselink/homekit-dashboard/discussions
[wikiUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki
[installationUrl]: INSTALLATION.md
[configurationUrl]: CONFIGURATION.md
[homekitDashboardHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=hwhesselink&repository=homekit-dashboard&category=plugin

[mushroomCards]: https://github.com/piitaya/lovelace-mushroom
[mushroomCardsHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=piitaya&repository=lovelace-mushroom
[cardMod]: https://github.com/thomasloven/lovelace-card-mod
[cardModHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=thomasloven&repository=lovelace-card-mod
[kioskMode]: https://github.com/NemesisRE/kiosk-mode
[kioskModeHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=NemesisRE&repository=kiosk-mode
[kioskModeVersion]: https://github.com/NemesisRE/kiosk-mode#installation

<!-- Other References -->

[hacsUrl]: https://hacs.xyz
[hacsInstallUrl]: https://www.hacs.xyz/docs/use

[miniGraphUrl]: https://github.com/kalkih/mini-graph-card
