import { ADULT_PRICE, CHILD_PRICE, INFANT_PRICE } from '../../../env.js';
import ticketTypeNames from './ticketTypeNames.js';

const ticketTypes = [
  {
    name: ticketTypeNames.ADULT,
    price: ADULT_PRICE,
  },
  {
    name: ticketTypeNames.CHILD,
    price: CHILD_PRICE,
  },
  {
    name: ticketTypeNames.INFANT,
    price: INFANT_PRICE,
  },
];

export default ticketTypes;
