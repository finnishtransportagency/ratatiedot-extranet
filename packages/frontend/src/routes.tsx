import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { Landing } from './pages/Landing';
import { Routes } from './constants/Routes';
import { ProtectedPage } from './pages/ProtectedPage';
import { RootBoundary } from './components/RootBoundary';
import { SearchResult } from './pages/Search/SearchResult';
import { InterchangeContactInformation } from './pages/ContactInformation/InterchangeContactInformation';
import { LineDiagrams } from './pages/Diagrams/LineDiagrams';
import { SpeedDiagrams } from './pages/Diagrams/SpeedDiagrams';
import { TrackDiagrams } from './pages/Diagrams/TrackDiagrams';
import { GroupingDiagrams } from './pages/Diagrams/GroupingDiagrams';
import { InterchangeDecisions } from './pages/Operations/InterchangeDecisions';
import { RailwaySigns } from './pages/Operations/RailwaySigns';
import { RailwayAssetNumbers } from './pages/Operations/RailwayAssetNumbers';
import { RailwayMaps } from './pages/Operations/RailwayMaps';
import { RailwayInterchangeDevelopmentNeeds } from './pages/Operations/RailwayInterchangeDevelopmentNeeds';
import { RouteDocuments } from './pages/Operations/RouteDocuments';
import { RINFRegister } from './pages/Operations/RINFRegister';
import { VAKRailDepot } from './pages/Operations/VAKRailDepot';
import { BridgeInspections } from './pages/SpecialtyStructures/BridgeInspections';
import { BridgeMaintenanceInstructions } from './pages/SpecialtyStructures/BridgeMaintenanceInstructions';
import { Tunnels } from './pages/SpecialtyStructures/Tunnels';
import { RailwayTunnelRescuePlans } from './pages/SpecialtyStructures/RailwayTunnelRescuePlans';
import { MaintenanceInstructions } from './pages/SafetyEquipment/MaintenanceInstructions';
import { Manuals } from './pages/SafetyEquipment/Manuals';
import { TrafficControl } from './pages/ContactInformation/TrafficControlContactInformation';
import { ManagementReports } from './pages/Others/ManagementReports';
import { MonitoringEquipment } from './pages/Others/MonitoringEquipment';
import { DriverActivity } from './pages/Others/DriverActivity';
import { PlanningArchive } from './pages/Others/PlanningArchive';
import { RailwayMonitoringService } from './pages/Others/RailwayMonitoringService';
import { getSubCategoryData } from './utils/helpers';
import categoryData from './assets/data/FinnishCategories.json';

const getProtectedRoute = (path: string, component: JSX.Element, pageTitle?: string) => ({
  path: path,
  element: <ProtectedPage children={component} pageTitle={pageTitle} />,
  errorElement: <RootBoundary />, // Send user here whenever error is thrown
  loader: async () => {
    // TODO: throw error if user has no permission
  },
  children: [],
});

const HOME_ROUTE = getProtectedRoute(Routes.HOME, <Landing />);
const SEARCH_ROUTE = getProtectedRoute(Routes.SEARCH_RESULT, <SearchResult />);

const SubCategoryNames = getSubCategoryData(categoryData);

const DIAGRAMS_ROUTES = [
  getProtectedRoute(Routes.LINE_DIAGRAMS, <LineDiagrams />, SubCategoryNames.LINE_DIAGRAMS),
  getProtectedRoute(Routes.SPEED_DIAGRAMS, <SpeedDiagrams />, SubCategoryNames.SPEED_DIAGRAMS),
  getProtectedRoute(Routes.TRACK_DIAGRAMS, <TrackDiagrams />, SubCategoryNames.TRACK_DIAGRAMS),
  getProtectedRoute(Routes.GROUPING_DIAGRAMS, <GroupingDiagrams />, SubCategoryNames.GROUPING_DIAGRAMS),
];

const OPERATION_ROUTES = [
  getProtectedRoute(Routes.INTERCHANGE_DECISIONS, <InterchangeDecisions />, SubCategoryNames.INTERCHANGE_DECISIONS),
  getProtectedRoute(Routes.RAILWAY_SIGNS, <RailwaySigns />, SubCategoryNames.RAILWAY_SIGNS),
  getProtectedRoute(Routes.RAILWAY_ASSET_NUMBERS, <RailwayAssetNumbers />, SubCategoryNames.RAILWAY_ASSET_NUMBERS),
  getProtectedRoute(Routes.RAILWAY_MAPS, <RailwayMaps />, SubCategoryNames.RAILWAY_MAPS),
  getProtectedRoute(
    Routes.RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS,
    <RailwayInterchangeDevelopmentNeeds />,
    SubCategoryNames.RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS,
  ),
  getProtectedRoute(Routes.ROUTE_DOCUMENTS, <RouteDocuments />, SubCategoryNames.ROUTE_DOCUMENTS),
  getProtectedRoute(Routes.RINF_REGISTER, <RINFRegister />, SubCategoryNames.RINF_REGISTER),
  getProtectedRoute(Routes.VAK_RAIL_DEPOT, <VAKRailDepot />, SubCategoryNames.VAK_RAIL_DEPOT),
];

const SPECIALTY_STRUCTURES_ROUTES = [
  getProtectedRoute(Routes.BRIDGE_INSPECTIONS, <BridgeInspections />, SubCategoryNames.BRIDGE_INSPECTIONS),
  getProtectedRoute(
    Routes.BRIDGE_MAINTENANCE_INSTRUCTIONS,
    <BridgeMaintenanceInstructions />,
    SubCategoryNames.BRIDGE_MAINTENANCE_INSTRUCTIONS,
  ),
  getProtectedRoute(Routes.TUNNELS, <Tunnels />, SubCategoryNames.TUNNELS),
  getProtectedRoute(
    Routes.RAILWAY_TUNNEL_RESCUE_PLANS,
    <RailwayTunnelRescuePlans />,
    SubCategoryNames.RAILWAY_TUNNEL_RESCUE_PLANS,
  ),
];

const SAFETY_EQUIPMENT_ROUTES = [
  getProtectedRoute(
    Routes.SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS,
    <MaintenanceInstructions />,
    SubCategoryNames.SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS,
  ),
  getProtectedRoute(Routes.SAFETY_EQUIPMENT_MANUALS, <Manuals />, SubCategoryNames.SAFETY_EQUIPMENT_MANUALS),
];

const CONTACT_INFORMATION_ROUTES = [
  getProtectedRoute(
    Routes.INTERCHANGE_CONTACT_INFORMATION,
    <InterchangeContactInformation />,
    SubCategoryNames.INTERCHANGE_CONTACT_INFORMATION,
  ),
  getProtectedRoute(
    Routes.TRAFFIC_CONTROL_CONTACT_INFORMATION,
    <TrafficControl />,
    SubCategoryNames.TRAFFIC_CONTROL_CONTACT_INFORMATION,
  ),
];

const OTHERS_ROUTES = [
  getProtectedRoute(Routes.MANAGEMENT_REPORTS, <ManagementReports />, SubCategoryNames.MANAGEMENT_REPORTS),
  getProtectedRoute(Routes.MONITORING_EQUIPMENT, <MonitoringEquipment />, SubCategoryNames.MONITORING_EQUIPMENT),
  getProtectedRoute(
    Routes.REGIONAL_LIMITATIONS_DRIVER_ACTIVITY,
    <DriverActivity />,
    SubCategoryNames.REGIONAL_LIMITATIONS_DRIVER_ACTIVITY,
  ),
  getProtectedRoute(Routes.PLANNING_ARCHIVE, <PlanningArchive />, SubCategoryNames.PLANNING_ARCHIVE),
  getProtectedRoute(
    Routes.RAILWAY_MONITORING_SERVICE,
    <RailwayMonitoringService />,
    SubCategoryNames.RAILWAY_MONITORING_SERVICE,
  ),
];

const routes: RouteObject[] = [
  HOME_ROUTE,
  SEARCH_ROUTE,
  ...DIAGRAMS_ROUTES,
  ...OPERATION_ROUTES,
  ...SPECIALTY_STRUCTURES_ROUTES,
  ...SAFETY_EQUIPMENT_ROUTES,
  ...CONTACT_INFORMATION_ROUTES,
  ...OTHERS_ROUTES,
  {
    path: Routes.LOGOUT_REDIRECT,
    loader: () => {
      document.cookie = 'Return=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // check if cookie is removed
      if (document.cookie.indexOf('Return') !== -1) {
        // TODO: What do we do if we ever get here? Now user might get stuck.
        throw new Error('Could not remove cookie.');
      }
      // redirect to logout url after succesfull cookie removal
      window.location.href = `${window.location.origin}/sso/logout?auth=1`;
    },
  },
];

export const router = createBrowserRouter(routes);
