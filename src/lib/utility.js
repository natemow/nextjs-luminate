
import Luminate from '@/lib/Luminate'

export const
  config = {
    org: process.env.NEXT_PUBLIC_ORGANIZATION,
    processingFee: parseFloat(process.env.NEXT_PUBLIC_PROCESSING_FEE),
    helpInfo: process.env.NEXT_PUBLIC_HELPINFO
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
