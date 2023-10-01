import ticketTypes from '../consts/ticketTypes.js';

/**
 * Immutable Object.
 */

export default class TicketTypeRequest {
  #type;

  #noOfTickets;

  #price;

  constructor(type, noOfTickets) {
    if (!this.#Type.includes(type)) {
      throw new TypeError(
        `type must be ${this.#Type
          .slice(0, -1)
          .join(', ')}, or ${this.#Type.slice(-1)}`
      );
    }

    if (!Number.isInteger(noOfTickets)) {
      throw new TypeError('noOfTickets must be an integer');
    }

    if (noOfTickets < 1) {
      throw new TypeError('noOfTickets must be greater than 0');
    }

    this.#price = ticketTypes.find(
      (ticketType) => ticketType.name === type
    ).price;
    this.#type = type;
    this.#noOfTickets = noOfTickets;

    // Makes the object immutable.
    Object.freeze(this);
  }

  getNoOfTickets() {
    return this.#noOfTickets;
  }

  getTicketType() {
    return this.#type;
  }

  getPrice() {
    return this.#price;
  }

  getTotalPrice() {
    return this.#price * this.#noOfTickets;
  }

  #Type = ticketTypes.map((ticketType) => ticketType.name);
}
