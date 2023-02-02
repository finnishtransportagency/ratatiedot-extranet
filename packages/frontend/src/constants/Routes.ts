import { getRouterName, getSubCategoryData } from '../utils/helpers';

const SubCategoryNames = getSubCategoryData();

export const Routes = {
  HOME: '/',
  ACCESS_DENIED: '/paasy-kielletty',
  NOT_FOUND: '/*',
  SEARCH_RESULT: '/haku',
  LOGOUT: 'logout',
  LOGOUT_REDIRECT: '/sso/*',
  LINE_DIAGRAMS: `/${getRouterName(SubCategoryNames.LINE_DIAGRAMS)}`,
  SPEED_DIAGRAMS: `/${getRouterName(SubCategoryNames.SPEED_DIAGRAMS)}`,
  TRACK_DIAGRAMS: `/${getRouterName(SubCategoryNames.TRACK_DIAGRAMS)}`,
  GROUPING_DIAGRAMS: `/${getRouterName(SubCategoryNames.GROUPING_DIAGRAMS)}`,
  INTERCHANGE_DECISIONS: `/${getRouterName(SubCategoryNames.INTERCHANGE_DECISIONS)}`,
  RAILWAY_SIGNS: `/${getRouterName(SubCategoryNames.RAILWAY_SIGNS)}`,
  RAILWAY_ASSET_NUMBERS: `/${getRouterName(SubCategoryNames.RAILWAY_ASSET_NUMBERS)}`,
  RAILWAY_MAPS: `/${getRouterName(SubCategoryNames.RAILWAY_MAPS)}`,
  RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS: `/${getRouterName(SubCategoryNames.RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS)}`,
  ROUTE_DOCUMENTS: `/${getRouterName(SubCategoryNames.ROUTE_DOCUMENTS)}`,
  RINF_REGISTER: `/${getRouterName(SubCategoryNames.RINF_REGISTER)}`,
  VAK_RAIL_DEPOT: `/${getRouterName(SubCategoryNames.VAK_RAIL_DEPOT)}`,
  BRIDGE_INSPECTIONS: `/${getRouterName(SubCategoryNames.BRIDGE_INSPECTIONS)}`,
  BRIDGE_MAINTENANCE_INSTRUCTIONS: `/${getRouterName(SubCategoryNames.BRIDGE_MAINTENANCE_INSTRUCTIONS)}`,
  TUNNELS: `/${getRouterName(SubCategoryNames.TUNNELS)}`,
  RAILWAY_TUNNEL_RESCUE_PLANS: `/${getRouterName(SubCategoryNames.RAILWAY_TUNNEL_RESCUE_PLANS)}`,
  SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS: `/${getRouterName(
    SubCategoryNames.SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS,
  )}`,
  SAFETY_EQUIPMENT_MANUALS: `/${getRouterName(SubCategoryNames.SAFETY_EQUIPMENT_MANUALS)}`,
  INTERCHANGE_CONTACT_INFORMATION: `/${getRouterName(SubCategoryNames.INTERCHANGE_CONTACT_INFORMATION)}`,
  TRAFFIC_CONTROL_CONTACT_INFORMATION: `/${getRouterName(SubCategoryNames.TRAFFIC_CONTROL_CONTACT_INFORMATION)}`,
  MANAGEMENT_REPORTS: `/${getRouterName(SubCategoryNames.MANAGEMENT_REPORTS)}`,
  MONITORING_EQUIPMENT: `/${getRouterName(SubCategoryNames.MONITORING_EQUIPMENT)}`,
  REGIONAL_LIMITATIONS_DRIVER_ACTIVITY: `/${getRouterName(SubCategoryNames.REGIONAL_LIMITATIONS_DRIVER_ACTIVITY)}`,
  PLANNING_ARCHIVE: `/${getRouterName(SubCategoryNames.PLANNING_ARCHIVE)}`,
  RAILWAY_MONITORING_SERVICE: `/${getRouterName(SubCategoryNames.RAILWAY_MONITORING_SERVICE)}`,
};
