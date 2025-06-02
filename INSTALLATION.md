# Installation

The [README][basicInstallationUrl] explains how to do a basic install if you already have [HACS][hacsUrl] installed.
This page goes into more detail.

If you're not using HACS or, for instance, want to install the recommended [card-mod performance improvements][cardModOptim] then you'll need access to your Home Assistant installation.
The most common ways to do this are:
- Studio Code Server
- SSH ("Advanced SSH & Web Terminal")
- Samba ("Samba share")
- File editor

They can all be installed via `Settings->Add-ons`.

## Installing HACS
If you want to install HACS follow the instructions [here][hacsInstallUrl].
For simple no need for have access to the file system...
but must have a Github account

## Dependencies
These can all be installed via HACS or manually, see their Github pages.

### Mushroom card collection
Most of the cards Homekit Dashboard uses are mushroom cards.
Install manually via [Github][mushroomCards] or via HACS:

[![Open in HACS at your Home Assistant instance.][hacsBadge]][mushroomCardsHacs]

### Card-mod 3
Used by Homekit Dashboard to style and tune various elements using CSS.
Install manually via [Github][cardMod] or via HACS:

[![Open in HACS at your Home Assistant instance.][hacsBadge]][cardModHacs]

Once installed follow the steps under [Performance improvements][cardMod].

### Kiosk mode
This is optional.
It allows extra control of the layout of the dashboard.
If installed it will by default remove the unused overflow button (top right) and the sidebar and menu button (top left) for non-admin users and on mobile devices.
You can define a boolean helper to toggle visibility of the menu button, see >> CONFIGURATION <<

> [!IMPORTANT]
> See [here][kioskModeVersion] for information about version compatibility.
> If you're running a version of Home Assistant earlier than 2025.5.0 then you need to install Kiosk Mode v6.7.0 or earlier.

Install manually via [Github][kioskMode] or via HACS:

[![Open in HACS at your Home Assistant instance.][hacsBadge]][kioskModeHacs]

## Installing Homekit Dashboard
### Via HACS
This is the easiest way:

[![Open in HACS at your Home Assistant instance.][hacsBadge]][homekitDashboardHacs]

### Manual Install
If installing manually then on your Home Assistant instance:
1. If it does not exist create the directory _/config/www_ and reboot Home Assistant
1. Download the [latest][latestRelease] release and unpack it
1. Copy the contents of the unpacked _dist_ directory to _/config/www_
1. Rename _/config/www/homekit-dashboard.js_ to _/config/www/homekit-dashboard.js?v=x.y.z_ where x.y.z is the version number of the release - this allows the front-end to recognize updates and flush its cache
1. Add the file as a resource:

#### If using storage mode (the default)
1. Go to `Settings->Dashboards`, click the 3 vertical dots at the top-right corner and select _Resources_ (Note:
if you do not see _Resources_ you need to enable _Advanced Mode_ in your User Profile)
1. Click on _ADD RESOURCE_
1. In the _URL_ field enter _/local/homekit-dashboard.js?v=x.y.z_ where the _x.y.z_ matches the filename from above
1. Make sure the _Resource type_ is set to _Javascript module_
1. Click _CREATE_

#### If using YAML mode
1. Edit your [configuration.yaml][haConfigURL] file and add the module as an [extra_module_url][haExtraModuleURL]:

   ```yaml
   frontend:
     extra_module_url:
       - /local/homekit-dashboard.js?v=x.y.z
   ```
1. Go to `Developer tools` and select the _YAML_ tab
1. Under `Check and restart` click on _CHECK CONFIGURATION_ to verify the configuration
1. Under `YAML configuration reloading` click on _ALL YAML CONFIGURATION_

After the resource has been added continue with [Configuring Homekit Dashboard][basicInstallationUrl] at the step beginning with _Restart Home Assistant:_

<!-- Repository References -->
[repositoryUrl]: https://github.com/hwhesselink/homekit-dashboard
[issuesUrl]: https://github.com/hwhesselink/homekit-dashboard/issues
[discussionsUrl]: https://github.com/hwhesselink/homekit-dashboard/discussions
[wikiUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki
[basicInstallationUrl]: https://github.com/hwhesselink/homekit-dashboard#configuring-homekit-dashboard
[installationUrl]: https://github.com/hwhesselink/homekit-dashboard/wiki#installation
[latestRelease]: https://github.com/hwhesselink/homekit-dashboard/releases/latest
[homekitDashboardHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=hwhesselink&repository=homekit-dashboard&category=plugin

<!-- Dependency References -->
[mushroomCards]: https://github.com/piitaya/lovelace-mushroom#-mushroom
[mushroomCardsHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=piitaya&repository=lovelace-mushroom
[cardMod]: https://github.com/thomasloven/lovelace-card-mod#card-mod-3
[cardModOptim]: https://github.com/thomasloven/lovelace-card-mod#performance-improvements
[cardModHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=thomasloven&repository=lovelace-card-mod
[kioskMode]: https://github.com/NemesisRE/kiosk-mode#kiosk-mode
[kioskModeHacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=NemesisRE&repository=kiosk-mode
[kioskModeVersion]: https://github.com/NemesisRE/kiosk-mode#installation

<!-- HACS References -->
[hacsUrl]: https://hacs.xyz
[hacsInstallUrl]: https://www.hacs.xyz/docs/use
[hacsBadge]: https://my.home-assistant.io/badges/hacs_repository.svg

<!-- HA References -->
[haConfigURL]: https://www.home-assistant.io/docs/configuration/
[haExtraModuleURL]: https://www.home-assistant.io/integrations/frontend/#loading-extra-javascript
