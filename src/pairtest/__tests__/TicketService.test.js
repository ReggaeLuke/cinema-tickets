import { jest } from '@jest/globals';
import { ADULT_PRICE, CHILD_PRICE, MAX_NUMBER_OF_TICKETS } from '../../../env';
import TicketService from '../TicketService';
import TicketTypeRequest from '../lib/TicketTypeRequest';
import ticketTypeNames from '../consts/ticketTypeNames';
import TicketPaymentService from '../../thirdparty/paymentgateway/TicketPaymentService';
import SeatReservationService from '../../thirdparty/seatbooking/SeatReservationService';

const accountId = 1;

const setupMocks = () => {
  const mockMakePayment = jest.spyOn(
    TicketPaymentService.prototype,
    'makePayment'
  );
  const mockReserveSeat = jest.spyOn(
    SeatReservationService.prototype,
    'reserveSeat'
  );

  return {
    mockMakePayment,
    mockReserveSeat,
  };
};

describe('TicketService', () => {
  describe('when there are no adult tickets being purchased', () => {
    it('throws an InvalidPurchaseException', () => {
      const ticketService = new TicketService();
      const ticketTypeRequests = [
        new TicketTypeRequest(ticketTypeNames.INFANT, 1),
        new TicketTypeRequest(ticketTypeNames.CHILD, 2),
      ];

      expect(ticketTypeRequests.length).toBe(2);

      expect(() =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
      ).toThrowError(
        'At least 1 adult ticket must be purchased for each transaction'
      );
    });
  });

  describe('when there are more infant tickets than adult tickets being purchased', () => {
    it('throws an InvalidPurchaseException', () => {
      const ticketService = new TicketService();
      const ticketTypeRequests = [
        new TicketTypeRequest(ticketTypeNames.INFANT, 2),
        new TicketTypeRequest(ticketTypeNames.ADULT, 1),
      ];

      expect(() =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
      ).toThrowError(
        'The number of infant tickets must be the same or less than the number of adult tickets'
      );
    });
  });

  describe('when more than the max allowed tickets are being purchased', () => {
    it('throws an InvalidPurchaseException', () => {
      const ticketService = new TicketService();
      const ticketTypeRequests = [
        new TicketTypeRequest(ticketTypeNames.INFANT, 10),
        new TicketTypeRequest(ticketTypeNames.ADULT, 10),
        new TicketTypeRequest(ticketTypeNames.CHILD, 10),
      ];

      expect(() =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
      ).toThrowError(
        `A maximum of ${MAX_NUMBER_OF_TICKETS} tickets can be purchased per transaction`
      );
    });
  });

  describe('when the purchase is valid', () => {
    it('makes a payment and reserves a seat', () => {
      const ticketService = new TicketService();
      const totalInfants = 1;
      const totalAdults = 2;
      const totalChildren = 3;
      const ticketTypeRequests = [
        new TicketTypeRequest(ticketTypeNames.INFANT, totalInfants),
        new TicketTypeRequest(ticketTypeNames.ADULT, totalAdults),
        new TicketTypeRequest(ticketTypeNames.CHILD, totalChildren),
      ];

      const totalToPay =
        ADULT_PRICE * totalAdults + CHILD_PRICE * totalChildren;
      const totalSeatReservations = totalAdults + totalChildren;

      const { mockMakePayment, mockReserveSeat } = setupMocks();

      ticketService.purchaseTickets(accountId, ...ticketTypeRequests);

      expect(mockMakePayment).toHaveBeenCalledWith(accountId, totalToPay);
      expect(mockReserveSeat).toHaveBeenCalledWith(
        accountId,
        totalSeatReservations
      );
    });
  });
});
