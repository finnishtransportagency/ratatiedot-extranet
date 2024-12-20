import { getMainCategoryData, getRouterName, getSubCategoryData } from '../utils/helpers';

const MainCategoryNames = getMainCategoryData();
const SubCategoryNames = getSubCategoryData();

export const Routes = {
  HOME: '/',
  ACCEPT_INSTRUCTIONS: '/hyvaksy-ohjeet',
  ACCESS_DENIED: '/paasy-kielletty',
  NOT_FOUND: '/*',
  SEARCH_RESULT: '/haku',
  LOGOUT: 'logout',
  LOGOUT_REDIRECT: '/sso/*',
  LINE_DIAGRAMS: `/${getRouterName(MainCategoryNames.DIAGRAMS)}/${getRouterName(SubCategoryNames.LINE_DIAGRAMS)}`,
  SPEED_DIAGRAMS: `/${getRouterName(MainCategoryNames.DIAGRAMS)}/${getRouterName(SubCategoryNames.SPEED_DIAGRAMS)}`,
  TRACK_DIAGRAMS: `/${getRouterName(MainCategoryNames.DIAGRAMS)}/${getRouterName(SubCategoryNames.TRACK_DIAGRAMS)}`,
  GROUPING_DIAGRAMS: `/${getRouterName(MainCategoryNames.DIAGRAMS)}/${getRouterName(
    SubCategoryNames.GROUPING_DIAGRAMS,
  )}`,
  INTERCHANGE_DECISIONS: `/${getRouterName(MainCategoryNames.OPERATIONS)}/${getRouterName(
    SubCategoryNames.INTERCHANGE_DECISIONS,
  )}`,
  RAILWAY_SIGNS: `/${getRouterName(MainCategoryNames.OPERATIONS)}/${getRouterName(SubCategoryNames.RAILWAY_SIGNS)}`,
  RAILWAY_ASSET_NUMBERS: `/${getRouterName(MainCategoryNames.OPERATIONS)}/${getRouterName(
    SubCategoryNames.RAILWAY_ASSET_NUMBERS,
  )}`,
  RAILWAY_MAPS: `/${getRouterName(MainCategoryNames.OPERATIONS)}/${getRouterName(SubCategoryNames.RAILWAY_MAPS)}`,
  RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS: `/${getRouterName(MainCategoryNames.OPERATIONS)}/${getRouterName(
    SubCategoryNames.RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS,
  )}`,
  ROUTE_DOCUMENTS: `/${getRouterName(MainCategoryNames.OPERATIONS)}/${getRouterName(SubCategoryNames.ROUTE_DOCUMENTS)}`,
  RINF_REGISTER: `/${getRouterName(MainCategoryNames.OPERATIONS)}/${getRouterName(SubCategoryNames.RINF_REGISTER)}`,
  VAK_RAIL_DEPOT: `/${getRouterName(MainCategoryNames.OPERATIONS)}/${getRouterName(SubCategoryNames.VAK_RAIL_DEPOT)}`,
  BRIDGE_INSPECTIONS: `/${getRouterName(MainCategoryNames.SPECIALTY_STRUCTURES)}/${getRouterName(
    SubCategoryNames.BRIDGE_INSPECTIONS,
  )}`,
  BRIDGE_MAINTENANCE_INSTRUCTIONS: `/${getRouterName(MainCategoryNames.SPECIALTY_STRUCTURES)}/${getRouterName(
    SubCategoryNames.BRIDGE_MAINTENANCE_INSTRUCTIONS,
  )}`,
  TUNNELS: `/${getRouterName(MainCategoryNames.SPECIALTY_STRUCTURES)}/${getRouterName(SubCategoryNames.TUNNELS)}`,
  RAILWAY_TUNNEL_RESCUE_PLANS: `/${getRouterName(MainCategoryNames.SPECIALTY_STRUCTURES)}/${getRouterName(
    SubCategoryNames.RAILWAY_TUNNEL_RESCUE_PLANS,
  )}`,
  SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS: `/${getRouterName(MainCategoryNames.SAFETY_EQUIPMENT)}/${getRouterName(
    SubCategoryNames.SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS,
  )}`,
  SAFETY_EQUIPMENT_MANUALS: `/${getRouterName(MainCategoryNames.SAFETY_EQUIPMENT)}/${getRouterName(
    SubCategoryNames.SAFETY_EQUIPMENT_MANUALS,
  )}`,
  INPUT_STATION_MANUALS: `/${getRouterName(MainCategoryNames.ELECTRIC_RAILWAY)}/${getRouterName(
    SubCategoryNames.INPUT_STATION_MANUALS,
  )}`,
  TRACK_MANAGEMENT_MANUALS: `/${getRouterName(MainCategoryNames.ELECTRIC_RAILWAY)}/${getRouterName(
    SubCategoryNames.TRACK_MANAGEMENT_MANUALS,
  )}`,
  INTERCHANGE_CONTACT_INFORMATION: `/${getRouterName(MainCategoryNames.CONTACT_INFORMATION)}/${getRouterName(
    SubCategoryNames.INTERCHANGE_CONTACT_INFORMATION,
  )}`,
  TRAFFIC_CONTROL_CONTACT_INFORMATION: `/${getRouterName(MainCategoryNames.CONTACT_INFORMATION)}/${getRouterName(
    SubCategoryNames.TRAFFIC_CONTROL_CONTACT_INFORMATION,
  )}`,
  MANAGEMENT_REPORTS: `/${getRouterName(MainCategoryNames.OTHERS)}/${getRouterName(
    SubCategoryNames.MANAGEMENT_REPORTS,
  )}`,
  MONITORING_EQUIPMENT: `/${getRouterName(MainCategoryNames.OTHERS)}/${getRouterName(
    SubCategoryNames.MONITORING_EQUIPMENT,
  )}`,
  REGIONAL_LIMITATIONS_DRIVER_ACTIVITY: `/${getRouterName(MainCategoryNames.OTHERS)}/${getRouterName(
    SubCategoryNames.REGIONAL_LIMITATIONS_DRIVER_ACTIVITY,
  )}`,
  PLANNING_ARCHIVE: `/${getRouterName(MainCategoryNames.OTHERS)}/${getRouterName(SubCategoryNames.PLANNING_ARCHIVE)}`,
  RAILWAY_MONITORING_SERVICE: `/${getRouterName(MainCategoryNames.OTHERS)}/${getRouterName(
    SubCategoryNames.RAILWAY_MONITORING_SERVICE,
  )}`,
  RAILWAY_CATEGORY: `/${getRouterName(MainCategoryNames.OTHERS)}/${getRouterName(SubCategoryNames.RAILWAY_CATEGORY)}`,
  OTHER_RAILWAY: `/${getRouterName(MainCategoryNames.OTHERS)}/${getRouterName(SubCategoryNames.OTHER_RAILWAY)}`,
  INSTRUCTIONS: '/kayttoohjeet',
  SEARCH_AND_FILTERS: `/${getRouterName(MainCategoryNames.INSTRUCTIONS)}/${getRouterName(
    SubCategoryNames.SEARCH_AND_FILTERS,
  )}`,
  FAVORITES: `/${getRouterName(MainCategoryNames.INSTRUCTIONS)}/${getRouterName(SubCategoryNames.FAVORITES)}`,
  LOGIN_AND_PERMISSIONS: `/${getRouterName(MainCategoryNames.INSTRUCTIONS)}/${getRouterName(
    SubCategoryNames.LOGIN_AND_PERMISSIONS,
  )}`,
  EDIT_TOOL: `/${getRouterName(MainCategoryNames.INSTRUCTIONS)}/${getRouterName(SubCategoryNames.EDIT_TOOL)}`,
  NOTICES: '/ajankohtaista',
  SINGLE_NOTICE: '/ajankohtaista/:id/:date',
  NEW_NOTICE: '/ajankohtaista/uusi',
};

export const STATIC_ROUTES = [
  getRouterName(SubCategoryNames.SEARCH_AND_FILTERS),
  getRouterName(SubCategoryNames.FAVORITES),
  getRouterName(SubCategoryNames.LOGIN_AND_PERMISSIONS),
  getRouterName(SubCategoryNames.EDIT_TOOL),
];
