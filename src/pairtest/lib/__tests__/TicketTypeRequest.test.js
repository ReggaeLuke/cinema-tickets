import { ADULT_PRICE } from '../../../../env';
import TicketTypeRequest from '../TicketTypeRequest.js';

describe('TicketTypeRequest', () => {
  const numberOfTickets = 3;
  describe('constructor', () => {
    it('should throw a TypeError if the type is not a valid ticket type', () => {
      expect(() => new TicketTypeRequest('Adult', 1)).toThrow(
        new TypeError('type must be ADULT, CHILD, or INFANT')
      );
    });

    it('should throw a TypeError if the noOfTickets is not an integer', () => {
      expect(() => new TicketTypeRequest('ADULT', 1.5)).toThrow(
        new TypeError('noOfTickets must be an integer')
      );
    });

    it.each([[-1], [0]])(
      'should throw a TypeError if the noOfTickets is less than 1',
      (numOfTickets) => {
        expect(() => new TicketTypeRequest('ADULT', numOfTickets)).toThrow(
          new TypeError('noOfTickets must be greater than 0')
        );
      }
    );
  });

  describe('getNoOfTickets', () => {
    it('should return the number of tickets', () => {
      const ticketTypeRequest = new TicketTypeRequest('ADULT', numberOfTickets);

      expect(ticketTypeRequest.getNoOfTickets()).toBe(numberOfTickets);
    });
  });

  describe('getTicketType', () => {
    it('should return the ticket type', () => {
      const ticketTypeRequest = new TicketTypeRequest('ADULT', numberOfTickets);

      expect(ticketTypeRequest.getTicketType()).toBe('ADULT');
    });
  });

  describe('getPrice', () => {
    it('should return the price', () => {
      const ticketTypeRequest = new TicketTypeRequest('ADULT', numberOfTickets);

      expect(ticketTypeRequest.getPrice()).toBe(ADULT_PRICE);
    });
  });

  describe('getTotalPrice', () => {
    it('should return the total price', () => {
      const ticketTypeRequest = new TicketTypeRequest('ADULT', numberOfTickets);

      const totalPrice = ticketTypeRequest.getPrice() * numberOfTickets;

      expect(ticketTypeRequest.getTotalPrice()).toBe(totalPrice);
    });
  });
});
