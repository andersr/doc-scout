/* eslint-disable @typescript-eslint/no-unused-vars */

export const stytchClient = {
  passwords: {
    authenticate: ({
      duration,
      email,
      password,
    }: {
      duration: number;
      email: string;
      password: string;
    }) => {
      return {
        session_token: email,
      };
    },
  },
  sessions: {
    authenticate: ({ session_token }: { session_token: string }) => {
      return {
        session_token,
        status_code: 200,
        user: {
          emails: [{ email: session_token }],
          user_id: session_token,
        },
      };
    },
  },
};
