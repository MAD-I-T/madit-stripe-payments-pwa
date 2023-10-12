// copied from @magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/creditCard.js
import React, {useMemo, useCallback, useState} from 'react';
import { useIntl } from 'react-intl';
import { bool, func, shape, string } from 'prop-types';
import { useCreditCard } from '../talons/useCreditCard';

import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import Country from '@magento/venia-ui/lib/components/Country';
import Region from '@magento/venia-ui/lib/components/Region';
import Postcode from '@magento/venia-ui/lib/components/Postcode';
import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import { useStyle } from '@magento/venia-ui/lib/classify';

import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/creditCard.module.css';
import FormError from '@magento/venia-ui/lib/components/FormError';
import GoogleReCaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha';
import { CardElement } from '@stripe/react-stripe-js';


import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery } from '@apollo/client';
import { GET_STRIPE_CONFIG_DATA } from '../talons/stripe.gql';
import CreditCardStripe from "./creditCardStripe";

const STEP_DESCRIPTIONS = [
    { defaultMessage: 'Loading Payment', id: 'checkoutPage.step0' },
    {
        defaultMessage: 'Checking Credit Card Information',
        id: 'checkoutPage.step1'
    },
    {
        defaultMessage: 'Checking Credit Card Information',
        id: 'checkoutPage.step2'
    },
    {
        defaultMessage: 'Checking Credit Card Information',
        id: 'checkoutPage.step3'
    },
    {
        defaultMessage: 'Saved Credit Card Information Successfully',
        id: 'checkoutPage.step4'
    }
];

/**
 * The initial view for the "Stripe Payments" payment method.
 */
const CreditCard = props => {

  const { formatMessage } = useIntl();
  const {
        classes: propClasses,
        onPaymentSuccess: onSuccess,
        onPaymentReady: onReady,
        onPaymentError: onError,
        resetShouldSubmit,
        shouldSubmit
    } = props;



  const { data, loading, error } = useQuery(GET_STRIPE_CONFIG_DATA);





  if(loading){

    const stepNumber = 0;
    const stepTitle =  formatMessage({
        id: 'checkoutPage.loadingPayment',
        defaultMessage: 'Loading Payment'
      });

    console.log('Is loading the api keys')

     return (
      <LoadingIndicator>{stepTitle}</LoadingIndicator>
    )
  }

  if(error){

    const stepTitle =  formatMessage({
      id: 'checkoutPage.loadingPayment',
      defaultMessage: 'Loading Error while loading Payment'
    });

    console.log('Error while fetching api keys')

    return (
      <LoadingIndicator>{stepTitle}</LoadingIndicator>
    )
  }





  const { stripe_mode, stripe_live_pk, stripe_test_pk } =
  data?.storeConfig || {};
  const stripeKey = stripe_mode === 'test' ? stripe_test_pk : stripe_live_pk;
  //console.log("Stripe mode and key", stripe_mode, stripeKey);
  //const [stripeJsPromise, setStripeJsPromise] = useState(() =>loadStripe(stripeKey));
  const stripeJsPromise = loadStripe(stripeKey);

  return (
    <Elements stripe={stripeJsPromise}>
      <CreditCardStripe {...props} />
    </Elements>
  );
};

export default CreditCard;

CreditCard.propTypes = {
    classes: shape({
        root: string,
        dropin_root: string,
        billing_address_fields_root: string,
        first_name: string,
        last_name: string,
        city: string,
        region: string,
        postal_code: string,
        phone_number: string,
        country: string,
        street1: string,
        street2: string,
        address_check: string,
        credit_card_root: string,
        credit_card_root_hidden: string
    }),
    shouldSubmit: bool.isRequired,
    onPaymentSuccess: func,
    onPaymentReady: func,
    onPaymentError: func,
    resetShouldSubmit: func.isRequired
};
