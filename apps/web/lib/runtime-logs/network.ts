export interface RuntimeLogNetworkMetadata {
  rawIp: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  asn: string | null;
  networkProvider: string | null;
}

const firstHeaderValue = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  return value.split(",")[0]?.trim() || null;
};

const decodeHeader = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const getRuntimeLogNetworkMetadata = (request: Request): RuntimeLogNetworkMetadata => {
  const headers = request.headers;

  return {
    rawIp:
      firstHeaderValue(headers.get("x-forwarded-for")) ??
      headers.get("x-real-ip") ??
      headers.get("cf-connecting-ip") ??
      null,
    countryCode: headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? null,
    region: decodeHeader(headers.get("x-vercel-ip-country-region") ?? headers.get("x-region")),
    city: decodeHeader(headers.get("x-vercel-ip-city") ?? headers.get("x-city")),
    timezone: decodeHeader(headers.get("x-vercel-ip-timezone") ?? headers.get("x-timezone")),
    asn: headers.get("x-vercel-ip-asn") ?? headers.get("x-asn") ?? null,
    networkProvider:
      decodeHeader(headers.get("x-vercel-ip-as-name")) ??
      decodeHeader(headers.get("x-network-provider")) ??
      null,
  };
};
