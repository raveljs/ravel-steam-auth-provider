# ravel-steam-auth-provider

> Ravel Authorization Provider for Steam

**Note:** This module is currently untested.

## Example usage:

*app.js*
```javascript
const Ravel = require('ravel');
const RavelSteamOpenIdProvider = require('@ravelravel-steam-auth-provider');

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
@inject('user-profiles')
class AuthConfig extends Module {
  constructor(userProfiles) {
    this.userProfiles = userProfiles;
  }
  serializeUser(profile) {
    // serialize profile to session using the id field
    return Promise.resolve(profile.id);
  }
  deserializeUser(id) {
    // retrieve profile from database using id from session
    return this.userProfiles.getProfile(id);
  }
  verify(providerName, ...args) {
    if (providerName === 'google-oauth2-web') {
      const accessToken = args[0];
      const refreshToken = args[1];
      const profile = args[2];
      // TODO something more complex, such as using/storing tokens
      return Promise.resolve(profile);
    }
  }
}

module.exports = AuthConfig;
```
