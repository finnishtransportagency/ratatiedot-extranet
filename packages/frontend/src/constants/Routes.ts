import { getMainCategoryData, getRouterName, getSubCategoryData } from '../utils/helpers';

const MainCategoryNames = getMainCategoryData();
const SubCategoryNames = getSubCategoryData();

export const Routes = {
  HOME: '/',
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
};

export const matchRouteWithCategory = (categoryPage: string) => {
  return Object.values(Routes).find((r) => r.indexOf(categoryPage) !== -1);
};
