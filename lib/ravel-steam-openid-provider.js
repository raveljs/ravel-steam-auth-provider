'use strict';

const SteamStrategy = require('passport-steam').Strategy;
const Ravel = require('ravel');

/**
 * A Ravel AuthorizationProvider for Steam OpenID.
 */
class SteamOpenIdProvider extends Ravel.AuthenticationProvider {
  constructor (ravelInstance) {
    super(ravelInstance);
    ravelInstance.registerParameter('steam auth path', true, '/auth/steam');
    ravelInstance.registerParameter('steam auth callback path', true, '/auth/steam/callback');

    ravelInstance.registerParameter('steam openid web return url', true);
    ravelInstance.registerParameter('steam openid web realm', true);
    ravelInstance.registerParameter('steam openid api key', true);
  }

  get name () {
    return 'steam-openid-web';
  }

  /**
   * Initialize passport.js with a strategy.
   *
   * @param {Object} app - An koa-router instance.
   * @param {Object} passport - A passport.js object.
   * @param {Function} verify - See passport-steam Strategy verify callback.
   */
  init (app, passport, verify) {
    passport.use(new SteamStrategy({
      returnURL: this.ravelInstance.get('steam openid web return url'),
      realm: this.ravelInstance.get('steam openid web realm'),
      apiKey: this.ravelInstance.get('steam openid api key')
    }, verify));

    app.get(this.ravelInstance.get('steam auth path'), passport.authenticate('steam'));

    app.get(this.ravelInstance.get('steam auth callback path'),
      passport.authenticate('steam', {
        failureRedirect: this.ravelInstance.get('login route'),
        successRedirect: this.ravelInstance.get('app route')
      })
    );
  }

  /**
   * Check to see if this authorization provider handle the given client type.
   *
   * @param {string} client - The client type, such as steam-openid-web.
   * @returns {boolean} - This returns true if and only if this provider handles the given client.
   */
  handlesClient (client) {
    return client === 'steam-openid-web';
  }

  /**
   * Transform a credential for an auth'd user into a user profile, iff the
   * credential is valid for this application.
   *
   * @param {string} credential - A credential.
   * @param {string} client - A client type, such as steam-openid-web.
   * @returns {Promise} - Resolves with user profile iff the credential is valid for this application, rejects otherwise.
   */
  credentialToProfile (credential, client) {
    return new Promise((resolve, reject) => {
      if (client === 'steam-openid-web') {
        resolve({});
      } else {
        reject(new this.ApplicationError.IllegalValue(`steam-openid-web provider cannot handle client ${client}`));
      }
    });
  }
}

module.exports = SteamOpenIdProvider;
