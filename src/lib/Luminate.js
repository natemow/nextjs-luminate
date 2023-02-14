
import axios from 'axios';

export default class Luminate {

  /**
   * Primary constructor for the Luminate class.
   *
   * @class Luminate
   * @constructor
   * @param { Object } config
   */
  constructor(config) {

    Object.keys(config).forEach(key => {
      this[key] = config[key];
    });

    this.endpoint = `${this.uri}${this.resource}?v=1.0&api_key=${this.key}&response_format=json`;

  }

  /**
   * Gets the endpoint to fetch from.
   *
   * @private
   * @method getEndpoint
   * @param { string } method The API method name.
   * @param { object } query The query params to append to the request.
   * @return { string }
   */
  _getEndpoint(method, query) {

    let endpoint = `${this.endpoint}&method=${method}`;

    Object.keys(query).forEach(key => {
      endpoint += `&${key}=${query[key]}`;
    });

    return endpoint;
  }


  /**
   * Get donation form levels
   *
   * @public
   * @method getDonationLevels
   * @param { number } formId The form ID.
   * @return { object }
   */
  getDonationLevels(formId) {

    const endpoint = this._getEndpoint('getDonationFormInfo', {
      form_id: formId
    });

    return axios.get(endpoint)
      .then(response => {
        const raw = response.data.getDonationFormInfoResponse.donationLevels.donationLevel,
              sorted = [];

        // Sort by amount.
        for (let i = 0; i < raw.length; i++) {
          sorted.push({
            level_id: parseInt(raw[i].level_id),
            userSpecified: (raw[i].userSpecified === 'true'),
            amount: parseFloat(raw[i].amount.decimal)
          })
        }

        sorted.sort((a, b) => {
          if (a.amount < b.amount) {
            return -1;
          }
          if (a.amount > b.amount) {
            return 1;
          }
          return 0;
        });

        return sorted;
      })
  }


  /**
   * Common payment handler.
   *
   * @private
   * @method _setPayment
   * @param { string } method The API method name.
   * @param { object } state The payment state.
   * @return { object }
   */
  async _setPayment(method, state) {

    const query = {
      validate: true.toString(),
      summary: 'both'
    };

    Object.keys(state).forEach(key => {
      query[key] = state[key].toString();
    });

    const endpoint = this._getEndpoint('donate', query);

    try {
      return await axios.post(endpoint);
    } catch (e) {
      return e.response.data.donationResponse;
    }
  }

  /**
   * Process card payment.
   *
   * @public
   * @method setPaymentCard
   * @param { object } state The payment state.
   * @return { object }
   */
  async setPaymentCard(state) {
    return this._setPayment('donate', state);
  }

  /**
   * Process PayPal payment.
   *
   * @public
   * @method setPaymentPaypal
   * @param { object } state The payment state.
   * @return { object }
   */
  async setPaymentPaypal(state) {
    return this._setPayment('startDonation', state);
  }

}
