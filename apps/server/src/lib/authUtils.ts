import jwt from "jsonwebtoken";

import { auth } from "./auth.ts";

const PROVIDER_ID = "keycloak";

export async function getJwtPayloadFromHeaders(headers?: Headers): Promise<jwt.JwtPayload | null> {
  const accounts = await auth.api.listUserAccounts({ headers });
  const account = accounts.find((candidate) => candidate.providerId === PROVIDER_ID);
  if (!account) {
    return null;
  }

  // `accountId` is the local account row id, not the provider subject.
  // https://www.better-auth.com/docs/guides/1-7-upgrade-guide
  const { accessToken } = await auth.api.getAccessToken({
    body: { accountId: account.id },
    headers,
  });
  return jwt.decode(accessToken, { json: true });
}
