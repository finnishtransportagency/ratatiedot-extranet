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

const getProtectedRoutes = (path: string, component: JSX.Element) => ({
  path: path,
  element: <ProtectedPage>{component}</ProtectedPage>,
  errorElement: <RootBoundary />, // Send user here whenever error is thrown
  loader: async () => {
    // TODO: throw error if user has no permission
  },
  children: [],
});

const HOME_ROUTE = getProtectedRoutes(Routes.HOME, <Landing />);
const SEARCH_ROUTE = getProtectedRoutes(Routes.SEARCH_RESULT, <SearchResult />);

const DIAGRAMS_ROUTES = [
  getProtectedRoutes(Routes.LINE_DIAGRAMS, <LineDiagrams />),
  getProtectedRoutes(Routes.SPEED_DIAGRAMS, <SpeedDiagrams />),
  getProtectedRoutes(Routes.TRACK_DIAGRAMS, <TrackDiagrams />),
  getProtectedRoutes(Routes.GROUPING_DIAGRAMS, <GroupingDiagrams />),
];

const OPERATION_ROUTES = [
  getProtectedRoutes(Routes.INTERCHANGE_DECISIONS, <InterchangeDecisions />),
  getProtectedRoutes(Routes.RAILWAY_SIGNS, <RailwaySigns />),
  getProtectedRoutes(Routes.RAILWAY_ASSET_NUMBERS, <RailwayAssetNumbers />),
  getProtectedRoutes(Routes.RAILWAY_MAPS, <RailwayMaps />),
  getProtectedRoutes(Routes.RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS, <RailwayInterchangeDevelopmentNeeds />),
  getProtectedRoutes(Routes.ROUTE_DOCUMENTS, <RouteDocuments />),
  getProtectedRoutes(Routes.RINF_REGISTER, <RINFRegister />),
  getProtectedRoutes(Routes.VAK_RAIL_DEPOT, <VAKRailDepot />),
];

const SPECIALTY_STRUCTURES_ROUTES = [
  getProtectedRoutes(Routes.BRIDGE_INSPECTIONS, <BridgeInspections />),
  getProtectedRoutes(Routes.BRIDGE_MAINTENANCE_INSTRUCTIONS, <BridgeMaintenanceInstructions />),
  getProtectedRoutes(Routes.TUNNELS, <Tunnels />),
  getProtectedRoutes(Routes.RAILWAY_TUNNEL_RESCUE_PLANS, <RailwayTunnelRescuePlans />),
];

const SAFETY_EQUIPMENT_ROUTES = [
  getProtectedRoutes(Routes.SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS, <MaintenanceInstructions />),
  getProtectedRoutes(Routes.SAFETY_EQUIPMENT_MANUALS, <Manuals />),
];

const CONTACT_INFORMATION_ROUTES = [
  getProtectedRoutes(Routes.INTERCHANGE_CONTACT_INFORMATION, <InterchangeContactInformation />),
  getProtectedRoutes(Routes.TRAFFIC_CONTROL_CONTACT_INFORMATION, <TrafficControl />),
];

const OTHERS_ROUTES = [
  getProtectedRoutes(Routes.MANAGEMENT_REPORTS, <ManagementReports />),
  getProtectedRoutes(Routes.MONITORING_EQUIPMENT, <MonitoringEquipment />),
  getProtectedRoutes(Routes.REGIONAL_LIMITATIONS_DRIVER_ACTIVITY, <DriverActivity />),
  getProtectedRoutes(Routes.PLANNING_ARCHIVE, <PlanningArchive />),
  getProtectedRoutes(Routes.RAILWAY_MONITORING_SERVICE, <RailwayMonitoringService />),
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
