
import { Country, State } from 'country-state-city'
import Luminate from '@/lib/Luminate'

export const
  config = {
    processingFee: parseFloat(process.env.NEXT_PUBLIC_PROCESSING_FEE),
    countryLimit: ['US', 'CA'],
    countryDefault: 'US'
  },
  API = new Luminate({
    key: process.env.NEXT_PUBLIC_API_KEY,
    uri: process.env.NEXT_PUBLIC_API_URI,
    resource: '/site/CRDonationAPI'
  }),
  Forms = {
    once: {
      standard:     parseInt(process.env.NEXT_PUBLIC_FORM_ONCE_STANDARD),
      tribute:      parseInt(process.env.NEXT_PUBLIC_FORM_ONCE_TRIBUTE),
      tributeMail:  parseInt(process.env.NEXT_PUBLIC_FORM_ONCE_TRIBUTE_MAIL)
    },
    sustain: {
      standard:     parseInt(process.env.NEXT_PUBLIC_FORM_SUSTAIN_STANDARD),
      tribute:      parseInt(process.env.NEXT_PUBLIC_FORM_SUSTAIN_TRIBUTE),
      tributeMail:  parseInt(process.env.NEXT_PUBLIC_FORM_SUSTAIN_TRIBUTE_MAIL)
    }
  };

export function clearInput(id) {
  const input = document.getElementById(id);

  if (!input) {
    return;
  }

  switch (input.tagName) {
    case 'SELECT':
      break;

    default:
      input.value = null;
      break;
  }
}

export function roundCurrency(amount) {
  return amount ? parseFloat(amount.toFixed(2)) : amount;
}

export function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return formatter.format(amount).replace('.00', '');
}

export function getProcessingFee(amount) {
  return roundCurrency(amount * config.processingFee);
}

export function getCountries() {
  const countries = Country.getAllCountries();

  return countries.filter(c => {
    return (config.countryLimit.indexOf(c.isoCode) >= 0);
  });
}

export function getStates(countryCode) {
  return State.getStatesOfCountry(countryCode);
}

export function formatDate(date) {
  const fmtYY = date.toLocaleDateString('en-us', { year:'numeric' }),
        fmtMM = date.toLocaleDateString('en-us', { month:'2-digit' }),
        fmtDD = date.toLocaleDateString('en-us', { day:'2-digit' });

  return `${fmtYY}-${fmtMM}-${fmtDD}`;
}
