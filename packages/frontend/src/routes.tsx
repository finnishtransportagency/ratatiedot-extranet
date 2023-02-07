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

const getProtectedRoute = (path: string, component: JSX.Element): RouteObject => ({
  path: path,
  element: <ProtectedPage children={component} />,
  errorElement: <RootBoundary />, // Send user here whenever error is thrown
  loader: async () => {
    // TODO: throw error if user has no permission
  },
  children: [],
});

const HOME_ROUTE = getProtectedRoute(Routes.HOME, <Landing />);
const SEARCH_ROUTE = getProtectedRoute(Routes.SEARCH_RESULT, <SearchResult />);

const DIAGRAMS_ROUTES = [
  getProtectedRoute(Routes.LINE_DIAGRAMS, <LineDiagrams />),
  getProtectedRoute(Routes.SPEED_DIAGRAMS, <SpeedDiagrams />),
  getProtectedRoute(Routes.TRACK_DIAGRAMS, <TrackDiagrams />),
  getProtectedRoute(Routes.GROUPING_DIAGRAMS, <GroupingDiagrams />),
];

const OPERATION_ROUTES = [
  getProtectedRoute(Routes.INTERCHANGE_DECISIONS, <InterchangeDecisions />),
  getProtectedRoute(Routes.RAILWAY_SIGNS, <RailwaySigns />),
  getProtectedRoute(Routes.RAILWAY_ASSET_NUMBERS, <RailwayAssetNumbers />),
  getProtectedRoute(Routes.RAILWAY_MAPS, <RailwayMaps />),
  getProtectedRoute(Routes.RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS, <RailwayInterchangeDevelopmentNeeds />),
  getProtectedRoute(Routes.ROUTE_DOCUMENTS, <RouteDocuments />),
  getProtectedRoute(Routes.RINF_REGISTER, <RINFRegister />),
  getProtectedRoute(Routes.VAK_RAIL_DEPOT, <VAKRailDepot />),
];

const SPECIALTY_STRUCTURES_ROUTES = [
  getProtectedRoute(Routes.BRIDGE_INSPECTIONS, <BridgeInspections />),
  getProtectedRoute(Routes.BRIDGE_MAINTENANCE_INSTRUCTIONS, <BridgeMaintenanceInstructions />),
  getProtectedRoute(Routes.TUNNELS, <Tunnels />),
  getProtectedRoute(Routes.RAILWAY_TUNNEL_RESCUE_PLANS, <RailwayTunnelRescuePlans />),
];

const SAFETY_EQUIPMENT_ROUTES = [
  getProtectedRoute(Routes.SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS, <MaintenanceInstructions />),
  getProtectedRoute(Routes.SAFETY_EQUIPMENT_MANUALS, <Manuals />),
];

const CONTACT_INFORMATION_ROUTES = [
  getProtectedRoute(Routes.INTERCHANGE_CONTACT_INFORMATION, <InterchangeContactInformation />),
  getProtectedRoute(Routes.TRAFFIC_CONTROL_CONTACT_INFORMATION, <TrafficControl />),
];

const OTHERS_ROUTES = [
  getProtectedRoute(Routes.MANAGEMENT_REPORTS, <ManagementReports />),
  getProtectedRoute(Routes.MONITORING_EQUIPMENT, <MonitoringEquipment />),
  getProtectedRoute(Routes.REGIONAL_LIMITATIONS_DRIVER_ACTIVITY, <DriverActivity />),
  getProtectedRoute(Routes.PLANNING_ARCHIVE, <PlanningArchive />),
  getProtectedRoute(Routes.RAILWAY_MONITORING_SERVICE, <RailwayMonitoringService />),
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
