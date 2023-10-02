import { MAX_NUMBER_OF_TICKETS } from '../../env.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import ticketTypeNames from './consts/ticketTypeNames.js';

export default class TicketService {
  #ticketPaymentService;

  #seatReservationService;

  constructor(ticketPaymentService, seatReservationService) {
    this.#ticketPaymentService = ticketPaymentService;
    this.#seatReservationService = seatReservationService;
  }

  // Check an adult ticket is being purchased
  #isAdultTicketBeingPurchased(ticketTypeRequests) {
    return ticketTypeRequests.some(
      (ticketTypeRequest) =>
        ticketTypeRequest.getTicketType() === ticketTypeNames.ADULT
    );
  }

  // Get the total number of tickets requested for purchase
  #getTotalTickets(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (totalTickets, ticketTypeRequest) =>
        totalTickets + ticketTypeRequest.getNoOfTickets(),
      0
    );
  }

  // Check the number of adult tickets is greater than or equal to the number of infant tickets
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

  // Get the total price of all tickets requested for purchase
  #getTotalPrice(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (totalPrice, ticketTypeRequest) =>
        totalPrice + ticketTypeRequest.getTotalPrice(),
      0
    );
  }

  // Get the total number of seat reservations requested for purchase
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
    if (accountId < 1) {
      throw new TypeError('Invalid account Id');
    }

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
