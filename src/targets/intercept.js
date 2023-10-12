const SECURITY_HEADER_DEFINITION = 'veniaSecurityHeaders';

module.exports = targets => {


  const { specialFeatures,  transformUpward} = targets.of('@magento/pwa-buildpack');
  specialFeatures.tap(flags => {
    /**
     *  Wee need to activate esModules, cssModules and GQL Queries to allow build pack to load our extension
     * {@link https://magento.github.io/pwa-studio/pwa-buildpack/reference/configure-webpack/#special-flags}.
     */
    flags[targets.name] = {
      esModules: true,
      cssModules: true,
      graphqlQueries: true,
      upward:true
    };
  });



  transformUpward.tapPromise(async definitions => {
    if (!definitions[SECURITY_HEADER_DEFINITION]) {
      throw new Error(
        `${
          targets.name
        } could not find its own definition in the emitted upward.yml`
      );
    }

    const shellHeaders = definitions.veniaAppShell.inline.headers.inline;
    const securityHeaders = definitions[SECURITY_HEADER_DEFINITION].inline;

    for (const name of Object.keys(securityHeaders)) {
      shellHeaders[name] = `${SECURITY_HEADER_DEFINITION}.${name}`;
    }
  });

  const { Targetables } = require('@magento/pwa-buildpack');
  const targetables = Targetables.using(targets);



  const {
    checkoutPagePaymentTypes,
    //editablePaymentTypes,
    summaryPagePaymentTypes
  } = targets.of('@magento/venia-ui');
  checkoutPagePaymentTypes.tap(payments =>
    payments.add({
      paymentCode: 'stripe_payments',
      importPath:  require.resolve('@madit/pwa-studio-stripe-payments/src/components/creditCard.js')
    })
  );

  summaryPagePaymentTypes.tap(paymentSummaries =>
    paymentSummaries.add({
      paymentCode: 'stripe_payments',
      importPath: '@madit/pwa-studio-stripe-payments/src/components/summary.js'
    })
  );

  /**
   * Dev-note; Optional workaround:
   *
   * If you don't want to add a custom GQL module on the M2 backend.
   * You might instead create a custom API key in your .env file and inject it like so:
   */

  /*
  envVarDefinitions.tap(defs => {
      defs.sections.push({
          name: 'Stripe publishable test key',
          variables: [
              {
                  name: 'STRIPE_TEST_KEY',
                  type: 'str',
                  desc: 'API key for stripe-payments testing'
              }
          ]
      });
  });
  */
};