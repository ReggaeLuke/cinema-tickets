import { jest } from '@jest/globals';
import { ADULT_PRICE, CHILD_PRICE, MAX_NUMBER_OF_TICKETS } from '../../../env';
import TicketService from '../TicketService';
import TicketTypeRequest from '../lib/TicketTypeRequest';
import ticketTypeNames from '../consts/ticketTypeNames';
import TicketPaymentService from '../../thirdparty/paymentgateway/TicketPaymentService';
import SeatReservationService from '../../thirdparty/seatbooking/SeatReservationService';

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
  const accountId = 1;
  const ticketPaymentService = new TicketPaymentService();
  const seatReservationService = new SeatReservationService();
  const ticketService = new TicketService(
    ticketPaymentService,
    seatReservationService
  );

  describe('when the account id is less than 1', () => {
    const adultTicket = [new TicketTypeRequest(ticketTypeNames.ADULT, 1)];
    it.each([
      [0, adultTicket],
      [-1, adultTicket],
    ])('throws an Error', (accountId, ticketTypeRequests) => {
      expect(() =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
      ).toThrowError('Invalid account Id');
    });
  });

  describe('when there are no adult tickets being purchased', () => {
    const infantsOnly = [new TicketTypeRequest(ticketTypeNames.INFANT, 5)];
    const childrenOnly = [new TicketTypeRequest(ticketTypeNames.CHILD, 5)];
    const infantsAndChildren = [
      new TicketTypeRequest(ticketTypeNames.INFANT, 5),
      new TicketTypeRequest(ticketTypeNames.CHILD, 5),
    ];

    it.each([[infantsOnly], [childrenOnly], [infantsAndChildren]])(
      'throws an InvalidPurchaseException',
      (ticketTypeRequests) => {
        expect(() =>
          ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
        ).toThrowError(
          'At least 1 adult ticket must be purchased for each transaction'
        );
      }
    );
  });

  describe('when more than the max allowed tickets are being purchased', () => {
    const adultsOnly = [new TicketTypeRequest(ticketTypeNames.ADULT, 22)];
    const adultsAndChildren = [
      new TicketTypeRequest(ticketTypeNames.ADULT, 10),
      new TicketTypeRequest(ticketTypeNames.CHILD, 15),
    ];
    const adultsAndInfants = [
      new TicketTypeRequest(ticketTypeNames.ADULT, 11),
      new TicketTypeRequest(ticketTypeNames.INFANT, 10),
    ];
    const adultsChildrenAndInfants = [
      new TicketTypeRequest(ticketTypeNames.ADULT, 10),
      new TicketTypeRequest(ticketTypeNames.CHILD, 10),
      new TicketTypeRequest(ticketTypeNames.INFANT, 10),
    ];
    it.each([
      [adultsOnly],
      [adultsAndChildren],
      [adultsAndInfants],
      [adultsChildrenAndInfants],
    ])('throws an InvalidPurchaseException', (ticketTypeRequests) => {
      expect(() =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
      ).toThrowError(
        `A maximum of ${MAX_NUMBER_OF_TICKETS} tickets can be purchased per transaction`
      );
    });
  });

  describe('when there are more infant tickets than adult tickets being purchased', () => {
    it('throws an InvalidPurchaseException', () => {
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

  describe('when the purchase is valid', () => {
    const adultsOnly = [new TicketTypeRequest(ticketTypeNames.ADULT, 2)];
    const adultsAndChildren = [
      new TicketTypeRequest(ticketTypeNames.ADULT, 2),
      new TicketTypeRequest(ticketTypeNames.CHILD, 3),
    ];
    const adultsAndInfants = [
      new TicketTypeRequest(ticketTypeNames.ADULT, 2),
      new TicketTypeRequest(ticketTypeNames.INFANT, 2),
    ];
    const adultsChildrenAndInfants = [
      new TicketTypeRequest(ticketTypeNames.ADULT, 2),
      new TicketTypeRequest(ticketTypeNames.CHILD, 3),
      new TicketTypeRequest(ticketTypeNames.INFANT, 1),
    ];
    it.each([
      [adultsOnly],
      [adultsAndChildren],
      [adultsAndInfants],
      [adultsChildrenAndInfants],
    ])('makes the payment and reserves the seats', (ticketTypeRequests) => {
      let totalChildren = 0;
      const totalAdults = ticketTypeRequests
        .find(
          (ticketTypeRequest) =>
            ticketTypeRequest.getTicketType() === ticketTypeNames.ADULT
        )
        .getNoOfTickets();

      if (
        ticketTypeRequests.some(
          (f) => f.getTicketType() === ticketTypeNames.CHILD
        )
      ) {
        totalChildren = ticketTypeRequests
          .find(
            (ticketTypeRequest) =>
              ticketTypeRequest.getTicketType() === ticketTypeNames.CHILD
          )
          .getNoOfTickets();
      }

      // Calculate the total to pay
      const totalToPay =
        ADULT_PRICE * totalAdults + CHILD_PRICE * totalChildren;

      // Calculate the total seat reservations
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
