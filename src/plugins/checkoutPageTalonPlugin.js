
import React, {useCallback, useEffect, useState} from 'react';
import {AlertCircle as AlertCircleIcon} from 'react-feather';

import {useCartContext} from '@magento/peregrine/lib/context/cart';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/checkoutPage.gql.js';
import {useToasts} from '@magento/peregrine';

import veniaPjson from '@magento/venia-ui/package.json';
import peregrinePjson from '@magento/peregrine/package.json';

import {
  useApolloClient,
  useLazyQuery,
  useMutation
} from '@apollo/client';

import {clearCartDataFromCache} from "@magento/peregrine/lib/Apollo/clearCartDataFromCache";
import {CHECKOUT_STEP} from "@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import Icon from "@magento/venia-ui/lib/components/Icon";

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery } from '@apollo/client';
import {GET_PAYMENT_METHOD, GET_STRIPE_CONFIG_DATA} from '../talons/stripe.gql';

const wrapUseCheckoutPage = (original) => {
  return function useCheckoutPage(...args) {
    const result = original(...args);



    // Check if we have a stripe_payment paymentMethod in Apollo Cache
    const [{ cartId }] = useCartContext();
    const { data: stripePaymentMethodData } = useQuery(GET_PAYMENT_METHOD, {
      skip: !cartId,
      variables: { cartId }
    });

    if (stripePaymentMethodData) {


      const { data } = useQuery(GET_STRIPE_CONFIG_DATA);
      const { stripe_mode, stripe_live_pk, stripe_test_pk } =
      data?.storeConfig || {};
      const stripeKey = stripe_mode === 'test' ? stripe_test_pk : stripe_live_pk;
      const [stripeJsPromise, setStripeJsPromise] = useState(() =>loadStripe(stripeKey));
     // console.log('USECHECKOUT using stripe payment', stripePaymentMethodData);
     // console.log('USERCHECKOUTusing stripe payment key', stripeKey);
     // console.log('USERCHECKOUTusing stripe payment promise', stripeJsPromise);
      return {
        ...result,
        stripeJsPromise: stripeJsPromise
      };
    } else {
      return {
        ...result,
        stripeJsPromise: null
      };
    }


  }
}

export default wrapUseCheckoutPage;