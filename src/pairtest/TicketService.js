import { MAX_NUMBER_OF_TICKETS } from '../../env.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import ticketTypeNames from './consts/ticketTypeNames.js';

export default class TicketService {
  #ticketPaymentService;

  #seatReservationService;

  constructor() {
    this.#ticketPaymentService = new TicketPaymentService();
    this.#seatReservationService = new SeatReservationService();
  }

  #isAdultTicketBeingPurchased(ticketTypeRequests) {
    return ticketTypeRequests.some(
      (ticketTypeRequest) =>
        ticketTypeRequest.getTicketType() === ticketTypeNames.ADULT
    );
  }

  #getTotalTickets(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (totalTickets, ticketTypeRequest) =>
        totalTickets + ticketTypeRequest.getNoOfTickets(),
      0
    );
  }

  #hasSameOrGreaterNumberOfAdultsThanInfants(ticketTypeRequests) {
    const adults = ticketTypeRequests.find(
      (ticketTypeRequest) =>
        ticketTypeRequest.getTicketType() === ticketTypeNames.ADULT
    );

    const infants = ticketTypeRequests.find(
      (ticketTypeRequest) =>
        ticketTypeRequest.getTicketType() === ticketTypeNames.INFANT
    );

    if (!infants) return true;

    return adults.getNoOfTickets() >= infants.getNoOfTickets();
  }

  #getTotalPrice(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (totalPrice, ticketTypeRequest) =>
        totalPrice + ticketTypeRequest.getTotalPrice(),
      0
    );
  }

  #getTotalSeatReservations(ticketTypeRequests) {
    return ticketTypeRequests
      .filter((f) => f.getTicketType() != ticketTypeNames.INFANT)
      .reduce(
        (totalSeatReservations, ticketTypeRequest) =>
          totalSeatReservations + ticketTypeRequest.getNoOfTickets(),
        0
      );
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!this.#isAdultTicketBeingPurchased(ticketTypeRequests)) {
      throw new InvalidPurchaseException(
        'At least 1 adult ticket must be purchased for each transaction'
      );
    }

    if (this.#getTotalTickets(ticketTypeRequests) > MAX_NUMBER_OF_TICKETS) {
      throw new InvalidPurchaseException(
        `A maximum of ${MAX_NUMBER_OF_TICKETS} tickets can be purchased per transaction`
      );
    }

    if (!this.#hasSameOrGreaterNumberOfAdultsThanInfants(ticketTypeRequests)) {
      throw new InvalidPurchaseException(
        'The number of infant tickets must be the same or less than the number of adult tickets'
      );
    }

    const totalAmountToPay = this.#getTotalPrice(ticketTypeRequests);
    this.#ticketPaymentService.makePayment(accountId, totalAmountToPay);

    const totalSeatReservations =
      this.#getTotalSeatReservations(ticketTypeRequests);
    this.#seatReservationService.reserveSeat(accountId, totalSeatReservations);
  }
}
