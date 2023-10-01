import InvalidPurchaseException from '../InvalidPurchaseException';

describe('InvalidPurchaseException', () => {
  it('has the correct name', () => {
    const invalidPurchaseException = new InvalidPurchaseException();

    expect(invalidPurchaseException.name).toEqual('InvalidPurchaseException');
  });

  it('has the correct message', () => {
    const message = 'Invalid purchase';
    const invalidPurchaseException = new InvalidPurchaseException(message);

    expect(invalidPurchaseException.message).toEqual(message);
  });
});
