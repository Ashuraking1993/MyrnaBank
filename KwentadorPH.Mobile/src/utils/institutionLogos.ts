const defaultLogo =
  require("../../assets/images/institutions/png.png");

const logos: Record<string, any> = {
  AUB: require("../../assets/images/institutions/aub.png"),
  "ASIA UNITED BANK": require("../../assets/images/institutions/aub.png"),

  BDO: require("../../assets/images/institutions/bdo.png"),
  "BDO UNIBANK": require("../../assets/images/institutions/bdo.png"),

  BPI: require("../../assets/images/institutions/bpi.png"),
  "BANK OF THE PHILIPPINE ISLANDS":
    require("../../assets/images/institutions/bpi.png"),

  CHINABANK:
    require("../../assets/images/institutions/china.png"),
  "CHINA BANK":
    require("../../assets/images/institutions/china.png"),

  CIMB: require("../../assets/images/institutions/cimb.png"),
  "CIMB BANK":
    require("../../assets/images/institutions/cimb.png"),

  EASTWEST:
    require("../../assets/images/institutions/eastwest.png"),
  "EASTWEST BANK":
    require("../../assets/images/institutions/eastwest.png"),

  GCASH:
    require("../../assets/images/institutions/gcash.png"),

  GOTYME:
    require("../../assets/images/institutions/gotyme.png"),
  "GOTYME BANK":
    require("../../assets/images/institutions/gotyme.png"),

  LANDBANK:
    require("../../assets/images/institutions/landbank.png"),
  "LAND BANK":
    require("../../assets/images/institutions/landbank.png"),

  MARIBANK:
    require("../../assets/images/institutions/maribank.png"),

  MAYA:
    require("../../assets/images/institutions/maya.png"),
  "MAYA BANK":
    require("../../assets/images/institutions/maya.png"),

  METROBANK:
    require("../../assets/images/institutions/metrobank.png"),

  PSBANK:
    require("../../assets/images/institutions/ps.png"),

  RCBC:
    require("../../assets/images/institutions/rcbc.png"),

  "SECURITY BANK":
    require("../../assets/images/institutions/security.png"),

  UNIONBANK:
    require("../../assets/images/institutions/ub.png"),
  "UNION BANK":
    require("../../assets/images/institutions/ub.png"),

  UCPB:
    require("../../assets/images/institutions/ucpb.png"),
};

export function getInstitutionLogo(
  name?: string
) {
  if (!name) return defaultLogo;

  const key = name
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

  return logos[key] ?? defaultLogo;
}