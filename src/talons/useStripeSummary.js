import { useQuery, useMutation } from '@apollo/client';
import { useCartContext } from '@magento/peregrine/lib/context/cart';

import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useEffect, useState } from 'react';
import defaultOperations from './stripeSummary.gql';
import { useStripe } from '@stripe/react-stripe-js';
import { CREATE_PAYMENT_INTENT } from './stripe.gql';

const mapBillingAddressData = rawBillingAddressData => {
    if (rawBillingAddressData) {
        const { street, country, region } = rawBillingAddressData;

        return {
            ...rawBillingAddressData,
            street1: street[0],
            street2: street[1],
            country: country.code,
            state: region.label
        };
    } else {
        return {};
    }
};

/**
 * Talon for the stripe summary view.
 *
 * @param {DocumentNode} props.operations operations used by this summary component
 *
 * @returns {
 *   billingAddress: {
 *      firstName: String,
 *      lastName: String,
 *      country: String,
 *      street1: String,
 *      street2: String,
 *      city: String,
 *      state: String,
 *      postalCode: String,
 *   },
 *   paymentMethod: {
 *      type: String,
 *      description: String,
 *      details: {
 *          cardType: String,
 *          lastFour: String,
 *          lastTwo: String
 *      },
 *   },
 *   isBillingAddressSame: Boolean,
 *   isLoading: Boolean,
 * }
 */
export const useStripeSummary = (props = {}) => {

    const [
        createPaymentIntent,
        {
            error: intentError,
            called: intentCalled,
            loading: intentLoading,
            data: intentData
        }
    ] = useMutation(CREATE_PAYMENT_INTENT);
    const CLIENT_SECRET = intentData?.createPaymentIntent?.intent_client_secret;

    const operations = mergeOperations(defaultOperations, props.operations);
    const { getStripeSummaryData } = operations.queries;

    const [{ cartId }] = useCartContext();
    const { data: summaryData, loading: isLoading } = useQuery(
        getStripeSummaryData,
        {
            skip: !cartId,
            variables: { cartId }
        }
    );

    const billingAddress = summaryData
        ? mapBillingAddressData(summaryData.cart.billingAddress)
        : {};

    const isBillingAddressSame = summaryData
        ? summaryData.cart.isBillingAddressSame
        : true;

    const [paymentMethod, setPaymentMethod] = useState();

    useEffect(() => {
        console.log('got summary data', summaryData);
        if (summaryData?.cart?.stripe_payment_method) {
            const pmArray = summaryData.cart.stripe_payment_method.split(':');
            setPaymentMethod({
                id: pmArray[0],
                details: {
                    cardType: pmArray[1],
                    lastFour: pmArray[2]
                }
            });
        }
    }, [summaryData, cartId]);

    return {
        billingAddress,
        isBillingAddressSame,
        isLoading,
        paymentMethod
    };
};
