import { WEDDING } from "./wedding";
export const RSVP_COPY = {
  acceptedTitle: "We Can't Wait to See You!",
  declinedTitle: "We'll Miss You!",
  acceptedMessage: (household: string) =>
    `Thank you, ${household}! Your RSVP has been received. We're so excited to celebrate with you on ${WEDDING.dateDisplay}!`,
  declinedMessage: (household: string) =>
    `Thank you for letting us know, ${household}. We'll miss you! You'll be in our hearts on our special day.`,
};
