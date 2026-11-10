// FIFA 3-letter code → country name and flag emoji. Flags are built from the ISO 3166 alpha-2 code
// (regional-indicator pairs); England, Scotland and Wales use the subdivision tag-sequence flags.

const regional = (iso2) => String.fromCodePoint(...[...iso2.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
const subdivision = (tag) => String.fromCodePoint(0x1f3f4, ...[...tag].map((ch) => 0xe0000 + ch.charCodeAt(0)), 0xe007f);

// [FIFA code, ISO alpha-2 (or gb-xxx subdivision), name]
const LIST = [
  ['CYP', 'cy', 'Cyprus'], ['LUX', 'lu', 'Luxembourg'], ['LVA', 'lv', 'Latvia'], ['MLT', 'mt', 'Malta'],
  ['PHI', 'ph', 'Philippines'], ['PRK', 'kp', 'North Korea'], ['SLV', 'sv', 'El Salvador'], ['TAN', 'tz', 'Tanzania'],
  ['ZAM', 'zm', 'Zambia'],
  ['ALG', 'dz', 'Algeria'], ['ANG', 'ao', 'Angola'], ['ARG', 'ar', 'Argentina'], ['ARM', 'am', 'Armenia'],
  ['AUS', 'au', 'Australia'], ['AUT', 'at', 'Austria'], ['BEL', 'be', 'Belgium'], ['BER', 'bm', 'Bermuda'],
  ['BFA', 'bf', 'Burkina Faso'], ['BIH', 'ba', 'Bosnia and Herzegovina'], ['BOL', 'bo', 'Bolivia'], ['BRA', 'br', 'Brazil'],
  ['BUL', 'bg', 'Bulgaria'], ['CAN', 'ca', 'Canada'], ['CHA', 'td', 'Chad'], ['CHI', 'cl', 'Chile'],
  ['CHN', 'cn', 'China'], ['CIV', 'ci', 'Ivory Coast'], ['CMR', 'cm', 'Cameroon'], ['COD', 'cd', 'DR Congo'],
  ['COL', 'co', 'Colombia'], ['CPV', 'cv', 'Cape Verde'], ['CRC', 'cr', 'Costa Rica'], ['CRO', 'hr', 'Croatia'],
  ['CUB', 'cu', 'Cuba'], ['CZE', 'cz', 'Czechia'], ['DEN', 'dk', 'Denmark'], ['ECU', 'ec', 'Ecuador'],
  ['EGY', 'eg', 'Egypt'], ['ENG', 'gb-eng', 'England'], ['ESP', 'es', 'Spain'], ['FIN', 'fi', 'Finland'],
  ['FRA', 'fr', 'France'], ['FRO', 'fo', 'Faroe Islands'], ['GAB', 'ga', 'Gabon'], ['GAM', 'gm', 'Gambia'],
  ['GEO', 'ge', 'Georgia'], ['GER', 'de', 'Germany'], ['GHA', 'gh', 'Ghana'], ['GRE', 'gr', 'Greece'],
  ['GUI', 'gn', 'Guinea'], ['HON', 'hn', 'Honduras'], ['HUN', 'hu', 'Hungary'], ['IRL', 'ie', 'Republic of Ireland'],
  ['IRN', 'ir', 'Iran'], ['IRQ', 'iq', 'Iraq'], ['ISL', 'is', 'Iceland'], ['ISR', 'il', 'Israel'],
  ['ITA', 'it', 'Italy'], ['JAM', 'jm', 'Jamaica'], ['JPN', 'jp', 'Japan'], ['KEN', 'ke', 'Kenya'],
  ['KOR', 'kr', 'South Korea'], ['KOS', 'xk', 'Kosovo'], ['KSA', 'sa', 'Saudi Arabia'], ['MAR', 'ma', 'Morocco'],
  ['MEX', 'mx', 'Mexico'], ['MKD', 'mk', 'North Macedonia'], ['MLI', 'ml', 'Mali'], ['NAM', 'na', 'Namibia'],
  ['NED', 'nl', 'Netherlands'], ['NGA', 'ng', 'Nigeria'], ['NIR', 'gb', 'Northern Ireland'], ['NOR', 'no', 'Norway'],
  ['NZL', 'nz', 'New Zealand'], ['PAN', 'pa', 'Panama'], ['PAR', 'py', 'Paraguay'], ['PER', 'pe', 'Peru'],
  ['POL', 'pl', 'Poland'], ['POR', 'pt', 'Portugal'], ['QAT', 'qa', 'Qatar'], ['ROU', 'ro', 'Romania'],
  ['RSA', 'za', 'South Africa'], ['RUS', 'ru', 'Russia'], ['SCO', 'gb-sct', 'Scotland'], ['SDN', 'sd', 'Sudan'],
  ['SEN', 'sn', 'Senegal'], ['SRB', 'rs', 'Serbia'], ['STP', 'st', 'São Tomé and Príncipe'], ['SUI', 'ch', 'Switzerland'],
  ['SUR', 'sr', 'Suriname'], ['SVK', 'sk', 'Slovakia'], ['SVN', 'si', 'Slovenia'], ['SWE', 'se', 'Sweden'],
  ['SYR', 'sy', 'Syria'], ['THA', 'th', 'Thailand'], ['TOG', 'tg', 'Togo'], ['TPE', 'tw', 'Chinese Taipei'],
  ['TRI', 'tt', 'Trinidad and Tobago'], ['TUN', 'tn', 'Tunisia'], ['TUR', 'tr', 'Türkiye'], ['UAE', 'ae', 'United Arab Emirates'],
  ['UGA', 'ug', 'Uganda'], ['UKR', 'ua', 'Ukraine'], ['URU', 'uy', 'Uruguay'], ['USA', 'us', 'United States'],
  ['UZB', 'uz', 'Uzbekistan'], ['VEN', 've', 'Venezuela'], ['WAL', 'gb-wls', 'Wales'],
];

// Northern Ireland has no standard emoji flag (its tag sequence shows as a plain black flag), so it uses the UK flag.
export const NATIONS = Object.fromEntries(LIST.map(([code, iso, name]) => [code, {
  name,
  iso,
  flag: iso.startsWith('gb-') ? subdivision(iso.replace('-', '')) : regional(iso),
}]));

export const nationOf = (code) => (code && NATIONS[code]) || null;
