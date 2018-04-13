# ravel-steam-auth-provider

> Ravel Authorization Provider for Steam

## Example usage:

*app.js*
```javascript
const Ravel = require('ravel');
const RavelSteamOpenIdProvider = require('@ravel\ravel-steam-auh-provider');

const app = new Ravel();
new RavelSteamOpenIdProvider(app); // eslint-disable-line no-new

// ... other providers and parameters

app.start();

// ... the rest of your Ravel app
```

## Configuration

Requiring the `ravel-steam-openid-provider` module will register configuration parameters with Ravel which must be supplied via `.ravelrc.json` or `app.set()`:

*.ravelrc.json*
```json
{
  "steam openid web return url" : "http://localhost:8080/auth/steam/callback",
  "steam openid web realm": "http://localhost:8080/",
  "steam openid api key": "YOUR_STEAM_API_KEY"
}
```

Note that `steam openid web return url` should be the external url for your application.

You'll also need to implement an `@authconfig` module like this:

*modules/authconfig.js*
```js
'use strict';

const Ravel = require('ravel');
const inject = Ravel.inject;
const Module = Ravel.Module;
const authconfig = Module.authconfig;

@authconfig
@inject('service.user-service')
class AuthConfig extends Module {
  constructor (userProvider) {
    super();
    this.userProvider = userProvider;
  }

  serializeUser (profile) {
    // serialize profile to session using the id field
    this.log.debug(`Serializing ${JSON.stringify(profile)} to session.`);
    return Promise.resolve(profile);
  }

  deserializeUser (profile) {
    // retrieve profile from database using id from session
    this.log.debug(`Retrieving user from DB using ${profile.id}`);
    return this.userProvider.getProfile(profile.id);
  }

  async verify (providerName, ...args) {
    this.log.debug(`Steam verify invoked for ${providerName}.`);
    if (providerName === 'steam-auth-web') {
      const profile = args[1];

      this.log.debug(`Verifying user with profile ${JSON.stringify(profile)}`);

      let user = null;
      const userExists = await this.userProvider.profileExists(profile.id);
      if (userExists === false) {
        this.log.debug('User does not exist, creating.');
        user = await this.userProvider.createProfile(profile);
      } else {
        this.log.debug('User exists, retrieving from DB.');
        user = await this.userProvider.getProfileBySteamId(profile.id);
      }

      this.log.debug(`User from DB: ${JSON.stringify(user)}`);
      return Promise.resolve(user);
    }
    return Promise.reject(new Error(`Unsupported authentication provider (${providerName}) used.`));
  }
}

module.exports = AuthConfig;
```
