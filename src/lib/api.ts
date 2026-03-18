export const paymentsApi = {
  async createDonation({ amount }: { amount: number; currency: string; message: string }) {
    const donationUrl = `/apoya?success=true&amount=${amount}`;

    return {
      data: {
        url: donationUrl,
      },
    };
  },
};
