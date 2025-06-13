# Homekit Dashboard

This is a user-friendly dashboard for everyday use of Home Assistant.
It has the look and feel of the Apple Home app so it’s intuitive for friends and family.
It’s a standard Home Assistant dashboard so works on both Android and Apple devices (and in browsers).

This is not just a skin or a theme.
It’s a complete dashboard generator that automatically creates all pages for domains, areas, sensor lists, etc,. all the links, badges and backgrounds, and does all the layout.

It automatically follows all changes to your Home Assistant configuration.
It uses [custom strategy](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/)
so adding or deleting devices and entities, moving them between areas, changing names, backgrounds, etc. is immediately reflected in the dashboard.

![combi view](docs/combi.jpg)

Homekit Dashboard makes extensive use of Home Assistant areas and labels ("On Home View", "Favorite", "In Summaries") and other settings.
Areas drive dashboard creation, only entities assigned to an area are included in the dashboard.
Labels determine what entities are included on the home page and in badges.
Adding entities is described in the [Populating the dashboard][populateURL] page in the wiki.

When installed with HACS it works out of the box: 3 lines of YAML are all you need to create a complete dashboard.
A configuration can optionally be attached to the dashboard to fine-tune the layout, but as much as possible the dashboard uses your Home Assistant configuration.
So for instance a background set on an area immediately shows up in the dashboard.

![combi view 2](docs/combi2.jpg)

# Configuring Homekit Dashboard

The [installation][installationUrl] wiki page goes into detail, including how to install without HACS, but tl;dr to get a bare dashboard up and running if you have [HACS][hacsInstallUrl] installed:

1. Install dependencies:
    - _Mushroom Cards_

    [![Open in HACS at your Home Assistant instance.][hacsBadge]][mushroomCardsHacs]

    - _Card Mod 3_
  
    [![Open in HACS at your Home Assistant instance.][hacsBadge]][cardModHacs]

    - and optionally _Kiosk Mode_ (Note: check [here][kioskModeVersion] for version compatibility depending on whether you're running Home Assistant 2025.5.0 or earlier) (Note 2: if you install the pre-release version v8.0.0-beta.0 see [here][configureKioskNewUrl] for how to handle the changed configuration format)
  
    [![Open in HACS at your Home Assistant instance.][hacsBadge]][kioskModeHacs]

1. Install Homekit Dashboard

    [![Open in HACS at your Home Assistant instance.][hacsBadge]][homekitDashboardHacs]

1. Restart Home Assistant: go to `Settings`, click the 3 vertical dots at the top-right corner and select _Restart Home Assistant_ from the drop-down, click _Restart Home Assistant_ and then _RESTART_

1. Go to `Settings->Dashboards`, click on _ADD DASHBOARD_ and create an empty dashboard

1. In the popup fill in the _Title_, leave the rest as-is and click _CREATE_

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
[Populating the dashboard][populateURL] explains how to add entities by assigning areas and labels.
The [configuration page][configurationUrl] explains how to change the home page name, default background and other settings.

If you already have entities assigned to areas they should show up in one of the other (non-Home) views, otherwise those views will also be empty.

The new dashboard should show up in the Companion App.
If it doesn't you may have to clear the frontend cache (on the device) by going to `Settings->Companion app->Debugging` and clicking _Reset the frontend cache_.

NOTE: by default the sidebar and overflow button are hidden on mobile devices if you have Kiosk Mode installed,
so if you're installing via a mobile device once you open the dashboard there will be no way to exit.
See the [configuration page][configureKioskUrl] for how to override this **before** installing via a mobile device.

[hacsBadge]: https://my.home-assistant.io/badges/hacs_repository.svg

[releaseBadge]: https://img.shields.io/github/v/tag/digilive/mushroom-strategy?filter=v2.3.2&label=Release

[sponsorBadge]: https://img.shields.io/badge/Sponsor_him-%E2%9D%A4-%23db61a2.svg?&logo=github&color=%23fe8e86

<!-- Repository References -->

[repositoryUrl]: https://github.com/hwhesselink/homekit-dashboard
[issuesUrl]: https://github.com/hwhesselink/homekit-dashboard/issues
[discussionsUrl]: https://github.com/hwhesselink/homekit-dashboard/discussions
[wikiUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki
[installationUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki/Installation
[populateURL]: https://github.com/hwhesselink/homekit-dashboard/wiki/Populating-the-dashboard
[configurationUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki/Configuration
[configureKioskUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki/Configuration#kiosk-mode
[configureKioskNewUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki/Configuration#kiosk-mode-new-style-config
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
